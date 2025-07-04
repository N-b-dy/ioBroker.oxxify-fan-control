"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var utils = __toESM(require("@iobroker/adapter-core"));
var DateTime = __toESM(require("date-and-time"));
var udp = __toESM(require("dgram"));
var NTP = __toESM(require("ntp-time"));
var import_queue_fifo = __toESM(require("queue-fifo"));
var import_DataHelpers = require("./lib/DataHelpers");
var import_ModelData = require("./lib/ModelData");
var Oxxify = __toESM(require("./lib/OxxifyProtocol"));
class OxxifyFanControl extends utils.Adapter {
  constructor(options = {}) {
    super({
      ...options,
      name: "oxxify-fan-control"
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
  async onReady() {
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
          de: "Ger\xE4te",
          ru: "\u0423\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430",
          pt: "Dispositivos",
          nl: "Apparaten",
          fr: "Dispositifs",
          it: "Dispositivi",
          es: "Dispositivos",
          pl: "Urz\u0105dzenia",
          uk: "\u041F\u0440\u0438\u0441\u0442\u0440\u043E\u0457",
          "zh-cn": "Devices"
        },
        role: void 0
      },
      native: {}
    });
    const stateDictionary = this.oxxify.StateDictionary;
    const availableObjects = await this.getDevicesAsync();
    let missingDevices = [];
    availableObjects.forEach((device) => {
      const parts = device._id.split(".");
      const lastPart = parts[parts.length - 1];
      missingDevices.push(lastPart);
    });
    await Promise.all(
      this.config.fans.map(async (element) => {
        const strCheckedId = this.RemoveInvalidCharacters(element.id);
        this.log.debug(`Fan configured: "${element.name}": ${strCheckedId} - ${element.ipaddr}`);
        await this.extendObject(`devices.${strCheckedId}`, {
          type: "device",
          common: {
            name: element.name,
            role: void 0
          }
        });
        await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.FanFolder}`, {
          type: "channel",
          common: {
            name: {
              en: "fans",
              de: "L\xFCfter",
              ru: "\u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u044B",
              pt: "f\xE3s",
              nl: "ventilatoren",
              fr: "fans",
              it: "tifosi",
              es: "ventiladores",
              pl: "fani",
              uk: "\u0448\u0430\u043D\u0443\u0432\u0430\u043B\u044C\u043D\u0438\u043A\u0438",
              "zh-cn": "fans"
            },
            role: void 0
          }
        });
        await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.NetworkFolder}`, {
          type: "channel",
          common: {
            name: {
              en: "Network",
              de: "Netzwerk",
              ru: "\u0421\u0435\u0442\u044C",
              pt: "Rede",
              nl: "Netwerk",
              fr: "R\xE9seau",
              it: "Rete",
              es: "Red",
              pl: "Sie\u0107",
              uk: "\u041C\u0435\u0440\u0435\u0436\u0430",
              "zh-cn": "Network"
            },
            role: void 0
          }
        });
        await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.SensorsFolder}`, {
          type: "channel",
          common: {
            name: {
              en: "Sensors",
              de: "Sensoren",
              ru: "\u0414\u0430\u0442\u0447\u0438\u043A\u0438",
              pt: "Sensores",
              nl: "Sensoren",
              fr: "Capteurs",
              it: "Sensori",
              es: "Sensores",
              pl: "Czujniki",
              uk: "\u0414\u0430\u0442\u0447\u0438\u043A\u0438",
              "zh-cn": "Sensors"
            },
            role: void 0
          }
        });
        await this.extendObject(`devices.${strCheckedId}.${Oxxify.OxxifyProtocol.SystemFolder}`, {
          type: "channel",
          common: {
            name: {
              en: "System",
              de: "System",
              ru: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430",
              pt: "Sistema",
              nl: "Systeem",
              fr: "Syst\xE8me",
              it: "Sistema",
              es: "Sistema",
              pl: "System",
              uk: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430",
              "zh-cn": "System"
            },
            role: void 0
          }
        });
        stateDictionary.forEach(async (value) => {
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
              states: value.states
            }
          });
        });
        missingDevices = missingDevices.filter((d) => d != strCheckedId);
      })
    );
    if (this.supportsFeature && this.supportsFeature("ADAPTER_DEL_OBJECT_RECURSIVE")) {
      missingDevices.forEach(async (missingDeviceId) => {
        this.log.info(
          `Objects and states regarding missing device ${this.namespace}.devices.${missingDeviceId} are deleted now.`
        );
        await this.delObjectAsync(`devices.${missingDeviceId}`, { recursive: true });
      });
    }
    this.subscribeStates("devices.*");
    this.udpServer.on("error", (error) => {
      this.log.error(`Error: ${error}`);
      this.udpServer.close();
      this.udpServerErrorCount++;
      if (this.udpServerErrorCount < 3) {
        this.udpServer.bind(4001);
      } else {
        this.log.error(
          `This adapter had ${this.udpServerErrorCount} errors regarding the listening of the udp server to port 4001. Adapter is terminated now.`
        );
        if (typeof this.terminate === "function") {
          this.terminate();
        } else {
          process.exit();
        }
      }
    });
    this.udpServer.on("message", async (msg, info) => {
      await this.setState("info.connection", true, true);
      this.log.silly(
        `Received ${msg.length} bytes from ${info.address}:${info.port} - Data: ${msg.toString("hex")}`
      );
      const data = this.oxxify.ParseResponseData(msg);
      if (data.status !== import_ModelData.ParsingStatus.Ok) {
        this.log.warn(
          `Received frame from IP ${info.address} could not be parsed. Parsing status ${data.status} - data ${msg.toString("hex")}`
        );
      } else {
        if (data.receivedData.length > 0) {
          data.receivedData.forEach(async (dataPoint) => {
            await this.setState(
              `devices.${data.strFanId}.${dataPoint.strIdentifer}`,
              dataPoint.value,
              true
            );
          });
        }
      }
    });
    this.udpServer.bind(4001);
    this.udpServer.on("listening", () => {
      const address = this.udpServer.address();
      const port = address.port;
      const family = address.family;
      const ipaddr = address.address;
      this.log.debug(`Server is listening at: ${ipaddr}:${port} (${family})`);
      this.ReadAllFanData(true);
    });
    this.udpServer.on("close", () => {
      this.log.warn("Socket is closed");
    });
    let nPollingInterval = this.config.pollingInterval;
    if (nPollingInterval <= 1) {
      nPollingInterval = 1;
    }
    if (nPollingInterval > 86400) {
      nPollingInterval = 86400;
    }
    this.pollingInterval = this.setInterval(() => {
      this.ReadAllFanData(false);
    }, nPollingInterval * 1e3);
  }
  /**
   * Is called when adapter shuts down.
   *
   * @param callback The callback, which has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      this.clearTimeout(this.queneTimeout);
      this.clearInterval(this.pollingInterval);
      this.udpServer.close();
      callback();
    } catch (e) {
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
  onStateChange(strStateIdentifier, state) {
    if (state) {
      this.log.silly(`state ${strStateIdentifier} changed: ${state.val} (ack = ${state.ack})`);
      if (state.ack == false) {
        const strFanId = this.ParseFanId(strStateIdentifier);
        if (strFanId) {
          this.ProcessStateChange(strFanId, strStateIdentifier, state.val);
        }
      }
    } else {
      this.log.info(`state ${strStateIdentifier} deleted`);
    }
  }
  ProcessStateChange(strFanId, strStateIdentifier, value) {
    const fanData = this.GetFanDataFromConfig(strFanId);
    if (fanData) {
      const data = new import_ModelData.WriteDataModel(strFanId, fanData, strStateIdentifier, value);
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
  ReadAllFanData(bIncludeConstData) {
    this.config.fans.forEach((element) => {
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
      this.SendData(new import_ModelData.DataToSend(packet, element.ipaddr));
    });
  }
  /**
   * Parses the fan id from the ioBroker identifer. This fan id has 16 hexadecimal
   * characters and is added from the end user by the fan configuration.
   *
   * @param strId The identifier from ioBroker for the state, that has changed.
   * @returns The fan id if found or undefined.
   */
  ParseFanId(strId) {
    const strFanIdRegex = "[0-9A-Fa-f]{16}";
    const match = strId.match(strFanIdRegex);
    if (match) {
      return match.toString();
    }
    return void 0;
  }
  /**
   * Fetchs the configured fan data based on the provided identifier.
   *
   * @param strFanId The fan identifier, for which the configuration data is requested.
   * @returns The fan config data if found, otherwise undefined.
   */
  GetFanDataFromConfig(strFanId) {
    const data = this.config.fans.find((f) => f.id == strFanId);
    if (data == void 0) {
      return void 0;
    }
    return { strIpAddress: data.ipaddr, strPassword: data.password };
  }
  /**
   * Generic function to create a protocol frame to write a numeric value to the fan.
   *
   * @param data The data to write with necessary fan data as well.
   * @param writeNumberMethod The function from the OxxifyProtocol class, which adds the data to write.
   */
  WriteNumberFanData(data, writeNumberMethod) {
    const nValue = import_DataHelpers.DataHelpers.ParseInputNumber(data.value, this.log);
    if (isNaN(nValue)) {
      return;
    }
    this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
    const eParameterType = writeNumberMethod(nValue);
    this.oxxify.FinishFrame();
    this.SetInternalTargetValue(data, eParameterType);
    const packet = this.oxxify.ProtocolPacket;
    this.SendData(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
  }
  /**
   * Generic function to create a protocol frame to write a string value to the fan.
   *
   * @param data The data to write with necessary fan data as well.
   * @param writeStringMethod The function from the OxxifyProtocol class, which adds the data to write.
   */
  WriteStringFanData(data, writeStringMethod) {
    this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
    const eParameterType = writeStringMethod(String(data.value));
    this.oxxify.FinishFrame();
    this.SetInternalTargetValue(data, eParameterType);
    const packet = this.oxxify.ProtocolPacket;
    this.SendData(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
  }
  /**
   * Generic function to create a protocol frame to write a bool value to the fan.
   *
   * @param data The data to write with necessary fan data as well.
   * @param writeBoolMethod The function from the OxxifyProtocol class, which adds the data to write.
   */
  WriteBoolFanData(data, writeBoolMethod) {
    if (typeof data.value !== "boolean") {
      this.log.warn(`The value is not from type boolean.`);
      return;
    }
    this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
    const eParameterType = writeBoolMethod(Boolean(data.value));
    this.oxxify.FinishFrame();
    this.SetInternalTargetValue(data, eParameterType);
    const packet = this.oxxify.ProtocolPacket;
    this.SendData(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
  }
  /**
   * Generic function to create a protocol frame to trigger a funtion at the fan. like reseting stuff.
   *
   * @param data The data which contains the necessary fan data.
   * @param writeVoidMethod The function from the OxxifyProtocol class, triggers the function.
   */
  WriteVoidFanData(data, writeVoidMethod) {
    this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
    writeVoidMethod();
    this.oxxify.FinishFrame();
    const packet = this.oxxify.ProtocolPacket;
    this.SendData(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
  }
  /**
   * Sets the requested value to an internal multi-dimensional dictionary to cross-check within the polling timer,
   * if the requested value is already set. UDP is not that reliable as TCP, so this is a kind of safety mechanism
   * to ensure the requested value is wirtten sucessfully.
   *
   * @param data The data which contains the necessary fan data.
   * @param eParameterType The parameter type, which is related to the fan data.
   */
  SetInternalTargetValue(data, eParameterType) {
    if (this.targetValuesDictionary.has(data.strFanId) == false) {
      this.targetValuesDictionary.set(data.strFanId, /* @__PURE__ */ new Map());
    }
    const fanDataMap = this.targetValuesDictionary.get(data.strFanId);
    if (fanDataMap != void 0) {
      if (fanDataMap.has(eParameterType) == false) {
        fanDataMap.set(eParameterType, new import_ModelData.IoBrokerRewriteDataPoint(data.strStateIdentifier, data.value));
      }
      const fanData = fanDataMap.get(eParameterType);
      if (fanData != void 0) {
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
  SyncRtcClock(strFanId, fanData) {
    this.ntpClient.syncTime().then((value) => {
      const dateTime = DateTime.parse(value.time.toISOString(), "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]", true);
      this.log.debug(`Received local time via ntp: ${dateTime.toLocaleString()}`);
      this.oxxify.StartNewFrame(strFanId, fanData.strPassword);
      this.oxxify.WriteRtcDateTime(dateTime);
      this.oxxify.FinishFrame();
      const packet = this.oxxify.ProtocolPacket;
      this.udpServer.send(packet, 4e3, fanData.strIpAddress, (err) => {
        if (err != null) {
          this.log.error(err.message);
        } else {
          this.oxxify.StartNewFrame(strFanId, fanData.strPassword);
          this.oxxify.ReadRtcDateTime();
          this.oxxify.FinishFrame();
          const packet2 = this.oxxify.ProtocolPacket;
          const timeout = this.setTimeout(() => {
            this.SendData(new import_ModelData.DataToSend(packet2, fanData.strIpAddress));
            this.clearTimeout(timeout);
          }, 1e3);
        }
      });
    }).catch((reason) => {
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
  RemoveInvalidCharacters(strUserInput) {
    return (strUserInput || "").replace(this.FORBIDDEN_CHARS, "_");
  }
  /**
   * Adds the provided data to the send quene and starts the timeout for sending it.
   *
   * @param data The data which is added to the send quene.
   */
  SendData(data) {
    this.sendQuene.enqueue(data);
    if (this.queneTimeout == void 0) {
      this.queneTimeout = this.setTimeout(() => {
        this.ProcessSendQuene();
      }, 50);
    }
  }
  /**
   * Checks if any data is available within the send quene and sends it. If there is any data left, the
   * method retriggers itself within a timeout, if there is some data left in the quene.
   */
  ProcessSendQuene() {
    if (this.sendQuene.isEmpty() == false) {
      const sendData = this.sendQuene.dequeue();
      if (sendData != null) {
        this.log.silly(`Sending ${sendData.data.toString("hex")} to ${sendData.ipAddress}:${4e3}`);
        this.udpServer.send(sendData.data, 4e3, sendData.ipAddress, (err) => {
          if (err != null) {
            this.log.error(err.message);
          }
        });
      }
    }
    this.clearTimeout(this.queneTimeout);
    this.queneTimeout = void 0;
    if (this.sendQuene.isEmpty() == false) {
      if (this.queneTimeout == void 0) {
        this.queneTimeout = this.setTimeout(() => {
          this.ProcessSendQuene();
        }, 20);
      }
    } else {
      if (this.verifyTargetValuesTimeout == void 0) {
        this.verifyTargetValuesTimeout = this.setTimeout(() => {
          this.verifyTargetValues();
        }, 2500);
      }
    }
  }
  verifyTargetValues() {
    this.targetValuesDictionary.forEach(
      (targetFanData, strFanId) => {
        targetFanData.forEach(async (dataPoint, key) => {
          const currentState = await this.getStateAsync(dataPoint.strIdentifer);
          if ((currentState == null ? void 0 : currentState.val) != dataPoint.value) {
            if (dataPoint.nRetryCount <= this.nMaxRetryCount) {
              dataPoint.nRetryCount++;
              if (dataPoint.nRetryCount > this.nMaxRetryCount) {
                this.log.warn(
                  `Unable to write state ${dataPoint.strIdentifer} to new value ${dataPoint.value} (current value: ${currentState == null ? void 0 : currentState.val}) after ${dataPoint.nRetryCount - 1} retrys. No further attempt is made to write the value.`
                );
              } else {
                this.ProcessStateChange(strFanId, dataPoint.strIdentifer, dataPoint.value);
                this.log.info(
                  `Writing fan value retriggerd: State: ${dataPoint.strIdentifer} - Value: ${dataPoint.value} - Try ${dataPoint.nRetryCount}`
                );
              }
            }
          } else {
            targetFanData.delete(key);
          }
        });
      }
    );
    this.clearTimeout(this.verifyTargetValuesTimeout);
    this.verifyTargetValuesTimeout = void 0;
  }
  //#region Protected data members
  udpServer;
  udpServerErrorCount;
  oxxify = new Oxxify.OxxifyProtocol();
  sendQuene = new import_queue_fifo.default();
  queneTimeout = void 0;
  verifyTargetValuesTimeout = void 0;
  pollingInterval;
  ntpClient = new NTP.Client();
  nMaxRetryCount = 3;
  // Store the requested state changes here to add an generic repeat mechanism in case it is not set or responded properly
  targetValuesDictionary = /* @__PURE__ */ new Map();
  //#endregion
}
if (require.main !== module) {
  module.exports = (options) => new OxxifyFanControl(options);
} else {
  (() => new OxxifyFanControl())();
}
//# sourceMappingURL=main.js.map
