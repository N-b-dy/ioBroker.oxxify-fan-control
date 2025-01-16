/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";

// Load your modules here, e.g.:
// import * as fs from "fs";
import * as DateTime from "date-and-time";
import * as udp from "dgram";
import * as NTP from "ntp-time";
import Queue from "queue-fifo";
import { DataHelpers } from "./lib/DataHelpers";
import {
    DataToSend,
    type FanData,
    type FanRemoteEndpoint,
    ParsingStatus,
    type ReceivedData,
    WriteDataModel,
} from "./lib/ModelData";
import * as Oxxify from "./lib/OxxifyProtocol";

/**
 * The main class for this adapter.
 */
class OxxifyFanControl extends utils.Adapter {
    public constructor(options: Partial<utils.AdapterOptions> = {}) {
        super({
            ...options,
            name: "oxxify-fan-control",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("unload", this.onUnload.bind(this));

        this.udpServer = udp.createSocket("udp4");
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    private async onReady(): Promise<void> {
        // Reset the connection indicator during startup
        await this.setState("info.connection", false, true);

        this.log.debug(`NTP-Server: ${this.config.ntpServer}`);
        this.log.debug(`Fan data polling invervall: ${this.config.pollingInterval} seconds`);

        this.ntpClient = new NTP.Client(this.config.ntpServer);

        if (typeof this.config.fans == "undefined" || this.config.fans.length == 0) {
            this.log.error("Please set at least one vent in the adapter configuration!");
            return;
        }

        // Remove any old objects and recreate them on adapter start
        if (this.supportsFeature && this.supportsFeature("ADAPTER_DEL_OBJECT_RECURSIVE")) {
            await this.delObjectAsync("devices", { recursive: true });
        }

        await this.extendObject("devices", {
            type: "channel",
            common: {
                name: {
                    en: "Devices",
                    de: "Geräte",
                    ru: "Устройства",
                    pt: "Dispositivos",
                    nl: "Apparaten",
                    fr: "Dispositifs",
                    it: "Dispositivi",
                    es: "Dispositivos",
                    pl: "Urządzenia",
                    uk: "Пристрої",
                    "zh-cn": "Devices",
                },
                role: undefined,
            },
            native: {},
        });

        const stateDictionary = this.oxxify.StateDictionary;

        this.config.fans.forEach(async element => {
            this.log.debug(`Fan configured: "${element.name}": ${element.id} - ${element.ipaddr}`);

            await this.extendObject(`devices.${element.id}`, {
                type: "channel",
                common: {
                    name: element.name,
                    role: undefined,
                },
            });

            stateDictionary.forEach(async (value: FanData) => {
                await this.extendObject(`devices.${element.id}.${value.strIdentifer}`, {
                    type: "state",
                    common: {
                        name: value.name,
                        role: value.strRole,
                        read: true,
                        write: value.bIsWritable,
                        type: value.strType,
                        unit: value.strUnit,
                        min: value.minValue,
                        max: value.maxValue,
                    },
                });
            });
        });

        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
        this.subscribeStates("devices.*.fan.*");
        this.subscribeStates("devices.*.sensors.state*");
        this.subscribeStates("devices.*.sensors.target*");
        this.subscribeStates("devices.*.system.triggerRtcTimeSync");
        this.subscribeStates("devices.*.system.resetAlarms");

        // Emits when any error occurs
        this.udpServer.on("error", error => {
            this.log.error(`Error: ${error}`);
            this.udpServer.close();
        });

        // Emits on new datagram msg
        this.udpServer.on("message", async (msg, info) => {
            // Reset the connection indicator during startup
            await this.setState("info.connection", true, true);

            this.log.silly(
                `Received ${msg.length} bytes from ${info.address}:${info.port} - Data: ${msg.toString("hex")}`,
            );

            const data = this.oxxify.ParseResponseData(msg);

            if (data.status !== ParsingStatus.Ok) {
                this.log.warn(
                    `Received frame from IP ${info.address} could not be parsed. Parsing status ${data.status} - data ${msg.toString("hex")}`,
                );
            } else {
                if (data.receivedData.length > 0) {
                    data.receivedData.forEach(async (value: ReceivedData) => {
                        await this.setState(`devices.${data.strFanId}.${value.strIdentifer}`, value.value, true);
                    });
                }
            }
        });

        this.udpServer.bind(4001);

        // emits when socket is ready and listening for datagram msgs
        this.udpServer.on("listening", () => {
            const address = this.udpServer.address();
            const port = address.port;
            const family = address.family;
            const ipaddr = address.address;
            this.log.debug(`Server is listening at: ${ipaddr}:${port} (${family})`);

            this.ReadAllFanData(true);
        });

        //emits after the socket is closed using socket.close();
        this.udpServer.on("close", () => {
            this.log.warn("Socket is closed");
        });

        this.queneInterval = this.setInterval(() => {
            if (this.sendQuene.isEmpty() == false) {
                const sendData = this.sendQuene.dequeue();

                if (sendData != null) {
                    this.log.silly(`Sending ${sendData.data.toString("hex")} to ${sendData.ipAddress}:${4000}`);
                    this.udpServer.send(sendData.data, 4000, sendData.ipAddress, err => {
                        if (err != null) {
                            this.log.error(err.message);
                        }
                    });
                }
            }
        }, 25);

        this.pollingInterval = this.setInterval(() => {
            this.ReadAllFanData(false);
        }, this.config.pollingInterval * 1000);
    }

    /**
     * Is called when adapter shuts down.
     *
     * @param callback The callback, which has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            this.clearInterval(this.queneInterval);
            this.clearInterval(this.pollingInterval);

            this.udpServer.close();

            callback();
        } catch (e: any) {
            this.log.error(e.toString());
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes. Here the subscribed states are dispatched for the
     * dedicated actions regarding the fans.
     *
     * @param strStateIdentifier The state which has changed.
     * @param state The new value including meta data from ioBroker.
     */
    private onStateChange(strStateIdentifier: string, state: ioBroker.State | null | undefined): void {
        if (state) {
            // The state was changed
            this.log.silly(`state ${strStateIdentifier} changed: ${state.val} (ack = ${state.ack})`);

            if (state.ack == false) {
                const strFanId = this.ParseFanId(strStateIdentifier);

                if (strFanId) {
                    const fanData = this.GetFanDataFromConfig(strFanId);

                    if (fanData) {
                        const data = new WriteDataModel(strFanId, fanData, state.val);

                        switch (strStateIdentifier.split(".").pop()) {
                            case "boostModeFollowUpTime":
                                this.WriteNumberFanData(data, this.oxxify.WriteBoostModeFollowUpTime.bind(this.oxxify));
                                break;

                            case "fanOperatingMode":
                                this.WriteNumberFanData(data, this.oxxify.WriteOperatingMode.bind(this.oxxify));
                                break;

                            case "fanSpeedMode":
                                this.WriteNumberFanData(data, this.oxxify.WriteFanSpeedMode.bind(this.oxxify));
                                break;

                            case "fanState":
                                this.WriteBoolFanData(data, this.oxxify.WriteFanState.bind(this.oxxify));
                                break;

                            case "manualFanSpeed":
                                this.WriteNumberFanData(data, this.oxxify.WriteManualFanSpeed.bind(this.oxxify));
                                break;

                            case "nightModeTimerSetpoint":
                                this.WriteStringFanData(
                                    data,
                                    this.oxxify.WriteNightModeTimerSetPoint.bind(this.oxxify),
                                );
                                break;

                            case "partyModeTimerSetpoint":
                                this.WriteStringFanData(
                                    data,
                                    this.oxxify.WritePartyModeTimerSetPoint.bind(this.oxxify),
                                );
                                break;

                            case "resetFilterExchangeCountdown":
                                this.WriteVoidFanData(
                                    data,
                                    this.oxxify.WriteResetFilterExchangeCountdown.bind(this.oxxify),
                                );
                                break;

                            case "timeControlledMode":
                                this.WriteBoolFanData(data, this.oxxify.WriteTimeControlledMode.bind(this.oxxify));
                                break;

                            case "timerMode":
                                this.WriteNumberFanData(data, this.oxxify.WriteTimerMode.bind(this.oxxify));
                                break;

                            case "stateAnalogVoltageSensor":
                                this.WriteBoolFanData(
                                    data,
                                    this.oxxify.WriteAnalogVoltageSensorState.bind(this.oxxify),
                                );
                                break;

                            case "stateHumiditySensor":
                                this.WriteBoolFanData(data, this.oxxify.WriteHumiditySensorState.bind(this.oxxify));
                                break;

                            case "stateRelaisSensor":
                                this.WriteBoolFanData(data, this.oxxify.WriteRelaisSensorState.bind(this.oxxify));
                                break;

                            case "targetAnalogVoltageValue":
                                this.WriteNumberFanData(
                                    data,
                                    this.oxxify.WriteTargetAnalogVoltageValue.bind(this.oxxify),
                                );
                                break;

                            case "targetHumidityValue":
                                this.WriteNumberFanData(data, this.oxxify.WriteTargetHumidityValue.bind(this.oxxify));
                                break;

                            case "resetAlarms":
                                this.WriteVoidFanData(data, this.oxxify.WriteResetAlarmState.bind(this.oxxify));
                                break;

                            case "triggerRtcTimeSync":
                                this.SyncRtcClock(strFanId, fanData);
                                break;
                        }
                    }
                }
            }
        } else {
            // The state was deleted
            this.log.info(`state ${strStateIdentifier} deleted`);
        }
    }

    /**
     * Method to build up the protocol frame to read all data from the fans according to the protocol.
     *
     * @param bIncludeConstData True contains the const data like the firmware and the version, false excludes them.
     */
    private ReadAllFanData(bIncludeConstData: boolean): void {
        this.config.fans.forEach(element => {
            this.oxxify.StartNewFrame(element.id, element.password);
            this.oxxify.ReadFanState();
            this.oxxify.ReadFanSpeedMode();
            this.oxxify.ReadOperatingMode();
            this.oxxify.ReadOperatingTime();
            this.oxxify.ReadBoostState();
            this.oxxify.ReadBoostModeFollowUpTime();
            this.oxxify.ReadRtcBattery();
            this.oxxify.ReadAnalogVoltageSensorState();
            this.oxxify.ReadAlarmState();
            this.oxxify.ReadCloudServerEnabled();
            this.oxxify.ReadHumiditySensorState();
            this.oxxify.ReadRelaisSensorState();
            this.oxxify.ReadCurrentAnalogVoltage();
            this.oxxify.ReadCurrentHumidity();
            this.oxxify.ReadCurrentRelaisState();
            this.oxxify.ReadManualFanSpeed();
            this.oxxify.ReadFan1Speed();
            this.oxxify.ReadFan2Speed();
            this.oxxify.ReadFilterExchangeCountdown();
            this.oxxify.ReadFilterExchangeNecessary();
            this.oxxify.ReadWifiData();
            this.oxxify.ReadTimerModeValues();
            this.oxxify.ReadTargetAnalogVoltageValue();
            this.oxxify.ReadTargetHumidityValue();
            this.oxxify.ReadTimeControlledMode();
            this.oxxify.ReadRtcDateTime();
            if (bIncludeConstData) {
                this.oxxify.ReadFanType();
                this.oxxify.ReadFirmware();
            }
            this.oxxify.ReadNightModeTimerSetPoint();
            this.oxxify.ReadPartyModeTimerSetPoint();
            this.oxxify.ReadHumiditySensorOverSetPoint();
            this.oxxify.ReadAnalogVoltageSensorOverSetPoint();
            this.oxxify.FinishFrame();

            const packet = this.oxxify.ProtocolPacket;
            this.sendQuene.enqueue(new DataToSend(packet, element.ipaddr));
        });
    }

    /**
     * Parses the fan id from the ioBroker identifer. This fan id has 16 hexadecimal
     * characters and is added from the end user by the fan configuration.
     *
     * @param strId The identifier from ioBroker for the state, that has changed.
     * @returns The fan id if found or undefined.
     */
    private ParseFanId(strId: string): string | undefined {
        const strFanIdRegex = "[0-9A-Fa-f]{16}";
        const match = strId.match(strFanIdRegex);

        if (match) {
            return match.toString();
        }

        return undefined;
    }

    /**
     * Fetchs the configured fan data based on the provided identifier.
     *
     * @param strFanId The fan identifier, for which the configuration data is requested.
     * @returns The fan config data if found, otherwise undefined.
     */
    private GetFanDataFromConfig(strFanId: string): FanRemoteEndpoint | undefined {
        const data = this.config.fans.find(f => f.id == strFanId);

        if (data == undefined) {
            return undefined;
        }

        return { strIpAddress: data.ipaddr, strPassword: data.password };
    }

    /**
     * Generic function to create a protocol frame to write a numeric value to the fan.
     *
     * @param data The data to write with necessary fan data as well.
     * @param writeNumberMethod The function from the OxxifyProtocol class, which adds the data to write.
     */
    private WriteNumberFanData(data: WriteDataModel, writeNumberMethod: (nValue: number) => void): void {
        const nValue = DataHelpers.ParseInputNumber(data.value, this.log);

        if (isNaN(nValue)) {
            return;
        }

        this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
        writeNumberMethod(nValue);
        this.oxxify.FinishFrame();

        const packet = this.oxxify.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, data.fanData.strIpAddress));
    }

    /**
     * Generic function to create a protocol frame to write a string value to the fan.
     *
     * @param data The data to write with necessary fan data as well.
     * @param writeStringMethod The function from the OxxifyProtocol class, which adds the data to write.
     */
    private WriteStringFanData(data: WriteDataModel, writeStringMethod: (strValue: string) => void): void {
        this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
        writeStringMethod(String(data.value));
        this.oxxify.FinishFrame();

        const packet = this.oxxify.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, data.fanData.strIpAddress));
    }

    /**
     * Generic function to create a protocol frame to write a bool value to the fan.
     *
     * @param data The data to write with necessary fan data as well.
     * @param writeStringMethod The function from the OxxifyProtocol class, which adds the data to write.
     */
    private WriteBoolFanData(data: WriteDataModel, writeStringMethod: (bValue: boolean) => void): void {
        if (typeof data.value !== "boolean") {
            this.log.warn(`The value is not from type boolean.`);
            return;
        }

        this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
        writeStringMethod(Boolean(data.value));
        this.oxxify.FinishFrame();

        const packet = this.oxxify.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, data.fanData.strIpAddress));
    }

    /**
     * Generic function to create a protocol frame to trigger a funtion at the fan. like reseting stuff.
     *
     * @param data The data which contains the necessary fan data.
     * @param writeVoidMethod The function from the OxxifyProtocol class, triggers the function.
     */
    private WriteVoidFanData(data: WriteDataModel, writeVoidMethod: () => void): void {
        this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
        writeVoidMethod();
        this.oxxify.FinishFrame();

        const packet = this.oxxify.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, data.fanData.strIpAddress));
    }

    /**
     * Fetchs the current time from the configured NTP server and writes the date and time to the provided fan.
     *
     * @param strFanId The fan id, for which the time sync is processed.
     * @param fanData The related fan data to create the protocol frame.
     */
    private SyncRtcClock(strFanId: string, fanData: FanRemoteEndpoint): void {
        this.ntpClient
            .syncTime()
            .then((value: NTP.NTPPacket) => {
                const dateTime = DateTime.parse(value.time.toISOString(), "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]", true);
                this.log.debug(`Received local time via ntp: ${dateTime.toLocaleString()}`);
                this.oxxify.StartNewFrame(strFanId, fanData.strPassword);
                this.oxxify.WriteRtcDateTime(dateTime);
                this.oxxify.FinishFrame();

                const packet = this.oxxify.ProtocolPacket;

                // Immediately send the data, as any delay would make the time sync invalid
                this.udpServer.send(packet, 4000, fanData.strIpAddress, err => {
                    if (err != null) {
                        this.log.error(err.message);
                    } else {
                        // Retrigger a reading of the data, as a RTC write does not immediately return the right values
                        this.oxxify.StartNewFrame(strFanId, fanData.strPassword);
                        this.oxxify.ReadRtcDateTime();
                        this.oxxify.FinishFrame();

                        const packet = this.oxxify.ProtocolPacket;
                        const timeout = this.setTimeout(() => {
                            this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
                            this.clearTimeout(timeout);
                        }, 1000);
                    }
                });
            })
            .catch((reason: any) => {
                this.log.error(reason);
            });
    }

    //#region Protected data members

    udpServer: udp.Socket;
    oxxify: Oxxify.OxxifyProtocol = new Oxxify.OxxifyProtocol();
    sendQuene: Queue<DataToSend> = new Queue<DataToSend>();
    queneInterval: ioBroker.Interval | undefined;
    pollingInterval: ioBroker.Interval | undefined;
    ntpClient: NTP.Client = new NTP.Client();

    //#endregion
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new OxxifyFanControl(options);
} else {
    // otherwise start the instance directly
    (() => new OxxifyFanControl())();
}
