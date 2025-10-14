/*
 * Created with @iobroker/create-adapter v2.6.5
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from "@iobroker/adapter-core";

// Load your modules here, e.g.:
// import * as fs from "fs";
import * as udp from "dgram";
import * as NTP from "ntp-time";
import Queue from "queue-fifo";
import { DataHelpers } from "./lib/DataHelpers";
import {
    DataToSend,
    type FanData,
    type FanRemoteEndpoint,
    type IoBrokerDataPoint,
    IoBrokerRewriteDataPoint,
    ParsingStatus,
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
        this.udpServerErrorCount = 0;
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
            this.log.error("Please set at least one fan in the adapter configuration!");
            return;
        }

        await this.extendObject("devices", {
            type: "folder",
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

        // Collect all available configured devices within a list to find the no longer configured ones
        const availableObjects = await this.getDevicesAsync();
        let missingDevices: Array<string> = [];

        availableObjects.forEach(device => {
            const parts = device._id.split(".");
            const lastPart = parts[parts.length - 1];
            missingDevices.push(lastPart);
        });

        await Promise.all(
            this.config.fans.map(async element => {
                const strCheckedId = this.RemoveInvalidCharacters(element.id);

                this.log.debug(`Fan configured: "${element.name}": ${strCheckedId} - ${element.ipaddr}`);

                await this.extendObject(`devices.${strCheckedId}`, {
                    type: "device",
                    common: {
                        name: element.name,
                        role: undefined,
                    },
                });

                await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.FanFolder}`, {
                    type: "channel",
                    common: {
                        name: {
                            en: "fans",
                            de: "Lüfter",
                            ru: "вентиляторы",
                            pt: "fãs",
                            nl: "ventilatoren",
                            fr: "fans",
                            it: "tifosi",
                            es: "ventiladores",
                            pl: "fani",
                            uk: "шанувальники",
                            "zh-cn": "fans",
                        },
                        role: undefined,
                    },
                });

                await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.NetworkFolder}`, {
                    type: "channel",
                    common: {
                        name: {
                            en: "Network",
                            de: "Netzwerk",
                            ru: "Сеть",
                            pt: "Rede",
                            nl: "Netwerk",
                            fr: "Réseau",
                            it: "Rete",
                            es: "Red",
                            pl: "Sieć",
                            uk: "Мережа",
                            "zh-cn": "Network",
                        },
                        role: undefined,
                    },
                });

                await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.SensorsFolder}`, {
                    type: "channel",
                    common: {
                        name: {
                            en: "Sensors",
                            de: "Sensoren",
                            ru: "Датчики",
                            pt: "Sensores",
                            nl: "Sensoren",
                            fr: "Capteurs",
                            it: "Sensori",
                            es: "Sensores",
                            pl: "Czujniki",
                            uk: "Датчики",
                            "zh-cn": "Sensors",
                        },
                        role: undefined,
                    },
                });

                await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.SystemFolder}`, {
                    type: "channel",
                    common: {
                        name: {
                            en: "System",
                            de: "System",
                            ru: "Система",
                            pt: "Sistema",
                            nl: "Systeem",
                            fr: "Système",
                            it: "Sistema",
                            es: "Sistema",
                            pl: "System",
                            uk: "Система",
                            "zh-cn": "System",
                        },
                        role: undefined,
                    },
                });

                stateDictionary.forEach(async (value: FanData) => {
                    await this.extendObject(`devices.${strCheckedId}.${value.strIdentifer}`, {
                        type: "state",
                        common: {
                            name: value.name,
                            role: value.strRole,
                            read: value.bIsReadable,
                            write: value.bIsWritable,
                            type: value.strType,
                            unit: value.strUnit,
                            min: value.minValue,
                            max: value.maxValue,
                            states: value.states,
                        },
                    });
                });

                // Remove the configured fans from the avaialble ones in the object tree
                missingDevices = missingDevices.filter(d => d != strCheckedId);
            }),
        );

        // Remove any no longer available objects in the config
        if (this.supportsFeature && this.supportsFeature("ADAPTER_DEL_OBJECT_RECURSIVE")) {
            missingDevices.forEach(async missingDeviceId => {
                this.log.info(
                    `Objects and states regarding missing device ${this.namespace}.devices.${missingDeviceId} are deleted now.`,
                );
                await this.delObjectAsync(`devices.${missingDeviceId}`, { recursive: true });
            });
        }

        // Subscribing to the states on the root level, parsing of relevent data is in method onStateChange()
        this.subscribeStates("devices.*");

        // Emits when any error occurs
        this.udpServer.on("error", error => {
            this.log.error(`Error: ${error}`);
            this.udpServer.close();

            this.udpServerErrorCount++;

            // give it some retrys before exiting
            if (this.udpServerErrorCount < 3) {
                this.udpServer.bind(4001);
            } else {
                this.log.error(
                    `This adapter had ${this.udpServerErrorCount} errors regarding the listening of the udp server to port 4001. Adapter is terminated now.`,
                );

                if (typeof this.terminate === "function") {
                    this.terminate();
                } else {
                    process.exit();
                }
            }
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
                    data.receivedData.forEach(async (dataPoint: IoBrokerDataPoint) => {
                        await this.setState(
                            `devices.${data.strFanId}.${dataPoint.strIdentifer}`,
                            dataPoint.value,
                            true,
                        );
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

        // Limit the configured polling interval to the min/max values from json config
        let nPollingInterval = this.config.pollingInterval;

        if (nPollingInterval <= 1) {
            nPollingInterval = 1;
        }

        if (nPollingInterval > 86400) {
            nPollingInterval = 86400;
        }

        this.pollingInterval = this.setInterval(() => {
            this.ReadAllFanData(false);
        }, nPollingInterval * 1000);
    }

    /**
     * Is called when adapter shuts down.
     *
     * @param callback The callback, which has to be called under any circumstances!
     */
    private onUnload(callback: () => void): void {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            this.clearTimeout(this.queneTimeout);
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
                    this.ProcessStateChange(strFanId, strStateIdentifier, state.val);
                }
            }
        } else {
            // The state was deleted
            this.log.info(`state ${strStateIdentifier} deleted`);
        }
    }

    private ProcessStateChange(strFanId: string, strStateIdentifier: string, value: ioBroker.StateValue): void {
        const fanData = this.GetFanDataFromConfig(strFanId);

        if (fanData) {
            const data = new WriteDataModel(strFanId, fanData, strStateIdentifier, value);

            switch (strStateIdentifier.split(".").pop()) {
                case "boostModeFollowUpTime":
                    this.WriteNumberFanData(data, this.oxxify.WriteBoostModeFollowUpTime.bind(this.oxxify));
                    break;

                case "fanOperatingMode":
                    this.WriteStringFanData(data, this.oxxify.WriteOperatingMode.bind(this.oxxify));
                    break;

                case "fanSpeedMode":
                    this.WriteStringFanData(data, this.oxxify.WriteFanSpeedMode.bind(this.oxxify));
                    break;

                case "fanState":
                    this.WriteBoolFanData(data, this.oxxify.WriteFanState.bind(this.oxxify));
                    break;

                case "manualFanSpeed":
                    this.WriteNumberFanData(data, this.oxxify.WriteManualFanSpeed.bind(this.oxxify));
                    break;

                case "nightModeTimerSetpoint":
                    this.WriteStringFanData(data, this.oxxify.WriteNightModeTimerSetPoint.bind(this.oxxify));
                    break;

                case "partyModeTimerSetpoint":
                    this.WriteStringFanData(data, this.oxxify.WritePartyModeTimerSetPoint.bind(this.oxxify));
                    break;

                case "resetFilterExchangeCountdown":
                    this.WriteVoidFanData(data, this.oxxify.WriteResetFilterExchangeCountdown.bind(this.oxxify));
                    break;

                case "timeControlledMode":
                    this.WriteBoolFanData(data, this.oxxify.WriteTimeControlledMode.bind(this.oxxify));
                    break;

                case "timerMode":
                    this.WriteStringFanData(data, this.oxxify.WriteTimerMode.bind(this.oxxify));
                    break;

                case "stateAnalogVoltageSensor":
                    this.WriteBoolFanData(data, this.oxxify.WriteAnalogVoltageSensorState.bind(this.oxxify));
                    break;

                case "stateHumiditySensor":
                    this.WriteBoolFanData(data, this.oxxify.WriteHumiditySensorState.bind(this.oxxify));
                    break;

                case "stateRelaisSensor":
                    this.WriteBoolFanData(data, this.oxxify.WriteRelaisSensorState.bind(this.oxxify));
                    break;

                case "targetAnalogVoltageValue":
                    this.WriteNumberFanData(data, this.oxxify.WriteTargetAnalogVoltageValue.bind(this.oxxify));
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

    /**
     * Method to build up the protocol frame to read all data from the fans according to the protocol.
     *
     * @param bIncludeConstData True contains the const data like the firmware and the version, false excludes them.
     */
    private ReadAllFanData(bIncludeConstData: boolean): void {
        this.config.fans.forEach(element => {
            const strCheckedId = this.RemoveInvalidCharacters(element.id);

            this.oxxify.StartNewFrame(strCheckedId, element.password);
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
            this.SendData(new DataToSend(packet, element.ipaddr));
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
    private WriteNumberFanData(
        data: WriteDataModel,
        writeNumberMethod: (nValue: number) => Oxxify.ParameterType,
    ): void {
        const nValue = DataHelpers.ParseInputNumber(data.value, this.log);

        if (isNaN(nValue)) {
            return;
        }

        this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
        const eParameterType = writeNumberMethod(nValue);
        this.oxxify.FinishFrame();

        this.SetInternalTargetValue(data, eParameterType);

        const packet = this.oxxify.ProtocolPacket;
        this.SendData(new DataToSend(packet, data.fanData.strIpAddress));
    }

    /**
     * Generic function to create a protocol frame to write a string value to the fan.
     *
     * @param data The data to write with necessary fan data as well.
     * @param writeStringMethod The function from the OxxifyProtocol class, which adds the data to write.
     */
    private WriteStringFanData(
        data: WriteDataModel,
        writeStringMethod: (strValue: string) => Oxxify.ParameterType,
    ): void {
        this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
        const eParameterType = writeStringMethod(String(data.value));
        this.oxxify.FinishFrame();

        this.SetInternalTargetValue(data, eParameterType);

        const packet = this.oxxify.ProtocolPacket;
        this.SendData(new DataToSend(packet, data.fanData.strIpAddress));
    }

    /**
     * Generic function to create a protocol frame to write a bool value to the fan.
     *
     * @param data The data to write with necessary fan data as well.
     * @param writeBoolMethod The function from the OxxifyProtocol class, which adds the data to write.
     */
    private WriteBoolFanData(data: WriteDataModel, writeBoolMethod: (bValue: boolean) => Oxxify.ParameterType): void {
        if (typeof data.value !== "boolean") {
            this.log.warn(`The value is not from type boolean.`);
            return;
        }

        this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
        const eParameterType = writeBoolMethod(Boolean(data.value));
        this.oxxify.FinishFrame();

        this.SetInternalTargetValue(data, eParameterType);

        const packet = this.oxxify.ProtocolPacket;
        this.SendData(new DataToSend(packet, data.fanData.strIpAddress));
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
        this.SendData(new DataToSend(packet, data.fanData.strIpAddress));
    }

    /**
     * Sets the requested value to an internal multi-dimensional dictionary to cross-check within the polling timer,
     * if the requested value is already set. UDP is not that reliable as TCP, so this is a kind of safety mechanism
     * to ensure the requested value is wirtten sucessfully.
     *
     * @param data The data which contains the necessary fan data.
     * @param eParameterType The parameter type, which is related to the fan data.
     */
    private SetInternalTargetValue(data: WriteDataModel, eParameterType: Oxxify.ParameterType): void {
        if (this.targetValuesDictionary.has(data.strFanId) == false) {
            this.targetValuesDictionary.set(data.strFanId, new Map<Oxxify.ParameterType, IoBrokerRewriteDataPoint>());
        }

        const fanDataMap = this.targetValuesDictionary.get(data.strFanId);

        if (fanDataMap != undefined) {
            if (fanDataMap.has(eParameterType) == false) {
                fanDataMap.set(eParameterType, new IoBrokerRewriteDataPoint(data.strStateIdentifier, data.value));
            }

            const fanData = fanDataMap.get(eParameterType);

            if (fanData != undefined) {
                // Reset the retry counter on value change
                if (data.value != fanData.value) {
                    fanData.nRetryCount = 0;
                }

                fanData.value = data.value;
            }
        }
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
                const dateTime = value.time;
                this.log.debug(`Received local time via ntp: ${dateTime.toString()}`);
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
                            this.SendData(new DataToSend(packet, fanData.strIpAddress));
                            this.clearTimeout(timeout);
                        }, 1000);
                    }
                });
            })
            .catch((reason: any) => {
                this.log.error(reason);
            });
    }

    /**
     * Replaces the invalid characters from the provided input variable. If any is found, it is
     * replaced with underscore character "_".
     *
     * @param strUserInput The string to be checked for invalid characters.
     * @returns The input string with all invalid characters replaced.
     */
    private RemoveInvalidCharacters(strUserInput: string): string {
        return (strUserInput || "").replace(this.FORBIDDEN_CHARS, "_");
    }

    /**
     * Adds the provided data to the send quene and starts the timeout for sending it.
     *
     * @param data The data which is added to the send quene.
     */
    private SendData(data: DataToSend): void {
        this.sendQuene.enqueue(data);

        if (this.queneTimeout == undefined) {
            this.queneTimeout = this.setTimeout(() => {
                this.ProcessSendQuene();
            }, 50);
        }
    }

    /**
     * Checks if any data is available within the send quene and sends it. If there is any data left, the
     * method retriggers itself within a timeout, if there is some data left in the quene.
     */
    private ProcessSendQuene(): void {
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

        this.clearTimeout(this.queneTimeout);
        this.queneTimeout = undefined;

        if (this.sendQuene.isEmpty() == false) {
            // Avoid recreating a timeout, if it was already defined
            if (this.queneTimeout == undefined) {
                this.queneTimeout = this.setTimeout(() => {
                    this.ProcessSendQuene();
                }, 20);
            }
        } else {
            // The send quene is empty, trigger a recheck of the internally buffered values against the currently acknowledged ones
            if (this.verifyTargetValuesTimeout == undefined) {
                this.verifyTargetValuesTimeout = this.setTimeout(() => {
                    this.verifyTargetValues();
                }, 2500);
            }
        }
    }

    private verifyTargetValues(): void {
        this.targetValuesDictionary.forEach(
            (targetFanData: Map<Oxxify.ParameterType, IoBrokerRewriteDataPoint>, strFanId: string) => {
                targetFanData.forEach(async (dataPoint: IoBrokerRewriteDataPoint, key: Oxxify.ParameterType) => {
                    const currentState = await this.getStateAsync(dataPoint.strIdentifer);

                    if (currentState?.val != dataPoint.value) {
                        if (dataPoint.nRetryCount <= this.nMaxRetryCount) {
                            dataPoint.nRetryCount++;

                            if (dataPoint.nRetryCount > this.nMaxRetryCount) {
                                this.log.warn(
                                    `Unable to write state ${dataPoint.strIdentifer} to new value ${dataPoint.value} (current value: ${currentState?.val}) after ${dataPoint.nRetryCount - 1} retrys. No further attempt is made to write the value.`,
                                );
                            } else {
                                this.ProcessStateChange(strFanId, dataPoint.strIdentifer, dataPoint.value);
                                this.log.info(
                                    `Writing fan value retriggerd: State: ${dataPoint.strIdentifer} - Value: ${dataPoint.value} - Try ${dataPoint.nRetryCount}`,
                                );
                            }
                        }
                    } else {
                        // Remove the entry, once it was successfully written to the fan, because otherwise no external changes can happen (e.g. manual button press at the fan)
                        targetFanData.delete(key);
                    }
                });
            },
        );

        this.clearTimeout(this.verifyTargetValuesTimeout);
        this.verifyTargetValuesTimeout = undefined;
    }

    //#region Protected data members

    udpServer: udp.Socket;
    udpServerErrorCount: number;
    oxxify: Oxxify.OxxifyProtocol = new Oxxify.OxxifyProtocol();
    sendQuene: Queue<DataToSend> = new Queue<DataToSend>();
    queneTimeout: ioBroker.Timeout | undefined = undefined;
    verifyTargetValuesTimeout: ioBroker.Timeout | undefined = undefined;
    pollingInterval: ioBroker.Interval | undefined;
    ntpClient: NTP.Client = new NTP.Client();
    nMaxRetryCount: number = 3;

    // Store the requested state changes here to add an generic repeat mechanism in case it is not set or responded properly
    targetValuesDictionary: Map<string, Map<Oxxify.ParameterType, IoBrokerRewriteDataPoint>> = new Map<
        string,
        Map<Oxxify.ParameterType, IoBrokerRewriteDataPoint>
    >();

    //#endregion
}

if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new OxxifyFanControl(options);
} else {
    // otherwise start the instance directly
    (() => new OxxifyFanControl())();
}
