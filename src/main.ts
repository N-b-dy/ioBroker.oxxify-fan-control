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
import { DataToSend, ReceivedData } from "./lib/ModelData";
import * as Oxxify from "./lib/OxxifyProtocol";

type FanRemoteEndpoint = { strIpAddress: string; strPassword: string };

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
        // Initialize your adapter here

        // Reset the connection indicator during startup
        await this.setState("info.connection", false, true);

        this.log.debug(`NTP-Server: ${this.config.ntpServer}`);
        this.log.debug(`Fan data polling invervall: ${this.config.pollingInterval} seconds`);

        this.ntpClient = new NTP.Client(this.config.ntpServer);

        if (typeof this.config.fans == "undefined" || this.config.fans.length == 0) {
            this.log.error("Please set at least one vent in the adapter configuration!");
            return;
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

        const dataDictionary = this.protocolBuilder.DataDictionary;

        this.config.fans.forEach(async (element) => {
            this.log.debug('Fan configured: "' + element.name + '": ' + element.id + " - " + element.ipaddr);

            await this.extendObject("devices." + element.id, {
                type: "channel",
                common: {
                    name: element.name,
                    role: undefined,
                },
            });

            dataDictionary.forEach(async (value: Oxxify.FanData) => {
                await this.extendObject("devices." + element.id + "." + value.strIdentifer, {
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
        // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
        // this.subscribeStates("lights.*");
        // Or, if you really must, you can also watch all states. Don"t do this if you don"t need to. Otherwise this will cause a lot of unnecessary load on the system:
        this.subscribeStates("devices.*.fan.*");
        this.subscribeStates("devices.*.sensors.state*");
        this.subscribeStates("devices.*.sensors.target*");
        this.subscribeStates("devices.*.system.triggerRtcTimeSync");
        this.subscribeStates("devices.*.system.resetAlarms");

        // emits when any error occurs
        this.udpServer.on("error", (error) => {
            this.log.error("Error: " + error);
            this.udpServer.close();
        });

        // emits on new datagram msg
        this.udpServer.on("message", async (msg, info) => {
            // Reset the connection indicator during startup
            await this.setState("info.connection", true, true);

            this.log.silly(
                `Received ${msg.length} bytes from ${info.address}:${info.port} - Data: ${msg.toString("hex")}`,
            );
            const data = this.protocolBuilder.ParseResponseData(msg);

            if (data.receivedData.length > 0) {
                data.receivedData.forEach(async (value: ReceivedData) => {
                    await this.setState("devices." + data.strFanId + "." + value.strIdentifer, value.value, true);
                });
            }
        });

        this.udpServer.bind(4001);

        // emits when socket is ready and listening for datagram msgs
        this.udpServer.on("listening", async () => {
            const address = this.udpServer.address();
            const port = address.port;
            const family = address.family;
            const ipaddr = address.address;
            this.log.debug("Server is listening at: " + ipaddr + ":" + port + " (" + family + ")");

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
                    this.log.silly(
                        "Sending " + sendData.data.toString("hex") + " to " + sendData.ipAddress + ":" + 4000,
                    );
                    this.udpServer.send(sendData.data, 4000, sendData.ipAddress, (err) => {
                        if (err != null) this.log.error(err.message);
                    });
                }
            }
        }, 25);

        this.pollingInterval = this.setInterval(() => {
            this.ReadAllFanData(false);
        }, this.config.pollingInterval * 1000);
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
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
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed state changes
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
                        switch (strStateIdentifier.split(".").pop()) {
                            case "boostModeFollowUpTime":
                                this.WriteBoostModeFollowUpTime(strFanId, fanData, state.val);
                                break;

                            case "fanOperatingMode":
                                this.WriteOperatingMode(strFanId, fanData, state.val);
                                break;

                            case "fanSpeedMode":
                                this.WriteFanSpeedMode(strFanId, fanData, state.val);
                                break;

                            case "fanState":
                                this.WriteFanState(strFanId, fanData, state.val);
                                break;

                            case "manualFanSpeed":
                                this.WriteManualFanSpeed(strFanId, fanData, state.val);
                                break;

                            case "resetFilterExchangeCountdown":
                                this.ResetFilterExchangeCountdown(strFanId, fanData);
                                break;

                            case "timeControlledMode":
                                this.WriteTimeControlledMode(strFanId, fanData, state.val);
                                break;

                            case "timerMode":
                                this.WriteTimerMode(strFanId, fanData, state.val);
                                break;

                            case "stateAnalogVoltageSensor":
                                this.WriteAnalogVoltageSensorState(strFanId, fanData, state.val);
                                break;

                            case "stateHumiditySensor":
                                this.WriteHumiditySensorState(strFanId, fanData, state.val);
                                break;

                            case "stateRelaisSensor":
                                this.WriteRelaisSensorState(strFanId, fanData, state.val);
                                break;

                            case "targetAnalogVoltageValue":
                                this.WriteTargetAnalogVoltageValue(strFanId, fanData, state.val);
                                break;

                            case "targetHumidityValue":
                                this.WriteTargetHumidityValue(strFanId, fanData, state.val);
                                break;

                            case "resetAlarms":
                                this.ResetAlarms(strFanId, fanData);
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

    private ReadAllFanData(bIncludeConstData: boolean): void {
        this.config.fans.forEach((element) => {
            this.protocolBuilder.StartNewFrame(element.id, element.password);
            this.protocolBuilder.ReadFanState();
            this.protocolBuilder.ReadFanSpeedMode();
            this.protocolBuilder.ReadOperatingMode();
            this.protocolBuilder.ReadOperatingTime();
            this.protocolBuilder.ReadBoostState();
            this.protocolBuilder.ReadBoostModeFollowUpTime();
            this.protocolBuilder.ReadRtcBattery();
            this.protocolBuilder.ReadAnalogVoltageSensorState();
            this.protocolBuilder.ReadAlarmState();
            this.protocolBuilder.ReadCloudServerEnabled();
            this.protocolBuilder.ReadHumiditySensorState();
            this.protocolBuilder.ReadRelaisSensorState();
            this.protocolBuilder.ReadCurrentAnalogVoltage();
            this.protocolBuilder.ReadCurrentHumidity();
            this.protocolBuilder.ReadCurrentRelaisState();
            this.protocolBuilder.ReadManualFanSpeed();
            this.protocolBuilder.ReadFan1Speed();
            this.protocolBuilder.ReadFan2Speed();
            this.protocolBuilder.ReadFilterExchangeCountdown();
            this.protocolBuilder.ReadFilterExchangeNecessary();
            this.protocolBuilder.ReadWifiData();
            this.protocolBuilder.ReadTimerModeValues();
            this.protocolBuilder.ReadTargetAnalogVoltageValue();
            this.protocolBuilder.ReadTargetHumidityValue();
            this.protocolBuilder.ReadTimeControlledMode();
            this.protocolBuilder.ReadRtcDateTime();
            if (bIncludeConstData) {
                this.protocolBuilder.ReadFanType();
                this.protocolBuilder.ReadFirmware();
            }
            this.protocolBuilder.FinishFrame();

            const packet = this.protocolBuilder.ProtocolPacket;
            this.sendQuene.enqueue(new DataToSend(packet, element.ipaddr));
        });
    }

    private ParseFanId(strId: string): string | undefined {
        const strFanIdRegex = "[0-9A-Fa-f]{16}";
        const match = strId.match(strFanIdRegex);

        if (match) {
            return match.toString();
        }

        return undefined;
    }

    private GetFanDataFromConfig(strFanId: string): FanRemoteEndpoint | undefined {
        const data = this.config.fans.find((f) => f.id == strFanId);

        if (data == undefined) return undefined;

        return { strIpAddress: data.ipaddr, strPassword: data.password };
    }

    private WriteBoostModeFollowUpTime(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        if (typeof value !== "number") {
            this.log.warn("The value is not from type number.");
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteBoostModeFollowUpTime(Number(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteOperatingMode(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        const nValue = this.ParseInputNumber(value);

        if (isNaN(nValue)) return;

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteOperatingMode(nValue);
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteFanSpeedMode(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        const nValue = this.ParseInputNumber(value);

        if (isNaN(nValue)) return;

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteFanSpeedMode(nValue);
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteFanState(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        if (typeof value !== "boolean") {
            this.log.warn(`The value is not from type boolean.`);
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteFanState(Boolean(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteManualFanSpeed(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        if (typeof value !== "number") {
            this.log.warn("The value is not from type number.");
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteManualFanSpeed(Number(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private ResetFilterExchangeCountdown(strFanId: string, fanData: FanRemoteEndpoint): void {
        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteResetFilterExchangeCountdown();
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteTimeControlledMode(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        if (typeof value !== "boolean") {
            this.log.warn(`The value is not from type boolean.`);
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteTimeControlledMode(Boolean(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteTimerMode(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        const nValue = this.ParseInputNumber(value);

        if (isNaN(nValue)) return;

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteTimerMode(nValue);
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteAnalogVoltageSensorState(
        strFanId: string,
        fanData: FanRemoteEndpoint,
        value: ioBroker.StateValue,
    ): void {
        if (typeof value !== "boolean") {
            this.log.warn(`The value is not from type boolean.`);
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteAnalogVoltageSensorState(Boolean(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteHumiditySensorState(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        if (typeof value !== "boolean") {
            this.log.warn(`The value is not from type boolean.`);
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteHumiditySensorState(Boolean(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteRelaisSensorState(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        if (typeof value !== "boolean") {
            this.log.warn(`The value is not from type boolean.`);
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteRelaisSensorState(Boolean(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteTargetAnalogVoltageValue(
        strFanId: string,
        fanData: FanRemoteEndpoint,
        value: ioBroker.StateValue,
    ): void {
        if (typeof value !== "number") {
            this.log.warn(`The value is not from type number.`);
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteTargetAnalogVoltageValue(Number(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private WriteTargetHumidityValue(strFanId: string, fanData: FanRemoteEndpoint, value: ioBroker.StateValue): void {
        if (typeof value !== "number") {
            this.log.warn(`The value is not from type number.`);
            return;
        }

        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteTargetHumidityValue(Number(value));
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private ResetAlarms(strFanId: string, fanData: FanRemoteEndpoint): void {
        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
        this.protocolBuilder.WriteResetAlarmState();
        this.protocolBuilder.FinishFrame();

        const packet = this.protocolBuilder.ProtocolPacket;
        this.sendQuene.enqueue(new DataToSend(packet, fanData.strIpAddress));
    }

    private SyncRtcClock(strFanId: string, fanData: FanRemoteEndpoint): void {
        this.ntpClient
            .syncTime()
            .then((value: NTP.NTPPacket) => {
                const dateTime = DateTime.parse(value.time.toISOString(), "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]", true);
                this.log.debug("Received local time via ntp: " + dateTime.toLocaleString());

                this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
                this.protocolBuilder.WriteRtcDateTime(dateTime);
                this.protocolBuilder.FinishFrame();

                const packet = this.protocolBuilder.ProtocolPacket;

                // Immediately send the data, as any delay would make the time sync invalid
                this.udpServer.send(packet, 4000, fanData.strIpAddress, (err) => {
                    if (err != null) {
                        this.log.error(err.message);
                    } else {
                        // Retrigger a reading of the data, as a RTC write does not immediately return the right values
                        this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
                        this.protocolBuilder.ReadRtcDateTime();
                        this.protocolBuilder.FinishFrame();

                        const packet = this.protocolBuilder.ProtocolPacket;
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

    private ParseInputNumber(value: ioBroker.StateValue): number {
        if (typeof value !== "number" && typeof value !== "string") {
            this.log.warn(`The value is not from type number or string, but ${typeof value}`);
            return NaN;
        }

        let nValue = Number(value);

        if (typeof value === "string") {
            nValue = parseInt(value);

            // Give it a second try, if it was not parsable -> check for the first space as separating character
            if (isNaN(nValue)) nValue = parseInt(String(value).substring(0, String(value).indexOf(" ")));

            if (isNaN(nValue)) {
                this.log.warn(`Unable to parse the number from the input value: ${value}`);
            }
        }

        return nValue;
    }

    //#region Protected data members

    udpServer: udp.Socket;
    protocolBuilder: Oxxify.OxxifyProtocol = new Oxxify.OxxifyProtocol();
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
