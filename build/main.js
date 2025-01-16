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
      this.log.error("Please set at least one vent in the adapter configuration!");
      return;
    }
    if (this.supportsFeature && this.supportsFeature("ADAPTER_DEL_OBJECT_RECURSIVE")) {
      await this.delObjectAsync("devices", { recursive: true });
    }
    await this.extendObject("devices", {
      type: "channel",
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
    this.config.fans.forEach(async (element) => {
      this.log.debug(`Fan configured: "${element.name}": ${element.id} - ${element.ipaddr}`);
      await this.extendObject(`devices.${element.id}`, {
        type: "channel",
        common: {
          name: element.name,
          role: void 0
        }
      });
      stateDictionary.forEach(async (value) => {
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
            max: value.maxValue
          }
        });
      });
    });
    this.subscribeStates("devices.*.fan.*");
    this.subscribeStates("devices.*.sensors.state*");
    this.subscribeStates("devices.*.sensors.target*");
    this.subscribeStates("devices.*.system.triggerRtcTimeSync");
    this.subscribeStates("devices.*.system.resetAlarms");
    this.udpServer.on("error", (error) => {
      this.log.error(`Error: ${error}`);
      this.udpServer.close();
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
          data.receivedData.forEach(async (value) => {
            await this.setState(`devices.${data.strFanId}.${value.strIdentifer}`, value.value, true);
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
    this.queneInterval = this.setInterval(() => {
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
    }, 25);
    this.pollingInterval = this.setInterval(() => {
      this.ReadAllFanData(false);
    }, this.config.pollingInterval * 1e3);
  }
  /**
   * Is called when adapter shuts down.
   *
   * @param callback The callback, which has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
      this.clearInterval(this.queneInterval);
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
          const fanData = this.GetFanDataFromConfig(strFanId);
          if (fanData) {
            const data = new import_ModelData.WriteDataModel(strFanId, fanData, state.val);
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
                  this.oxxify.WriteNightModeTimerSetPoint.bind(this.oxxify)
                );
                break;
              case "partyModeTimerSetpoint":
                this.WriteStringFanData(
                  data,
                  this.oxxify.WritePartyModeTimerSetPoint.bind(this.oxxify)
                );
                break;
              case "resetFilterExchangeCountdown":
                this.WriteVoidFanData(
                  data,
                  this.oxxify.WriteResetFilterExchangeCountdown.bind(this.oxxify)
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
                  this.oxxify.WriteAnalogVoltageSensorState.bind(this.oxxify)
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
                  this.oxxify.WriteTargetAnalogVoltageValue.bind(this.oxxify)
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
      this.log.info(`state ${strStateIdentifier} deleted`);
    }
  }
  /**
   * Method to build up the protocol frame to read all data from the fans according to the protocol.
   *
   * @param bIncludeConstData True contains the const data like the firmware and the version, false excludes them.
   */
  ReadAllFanData(bIncludeConstData) {
    this.config.fans.forEach((element) => {
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
      this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, element.ipaddr));
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
    writeNumberMethod(nValue);
    this.oxxify.FinishFrame();
    const packet = this.oxxify.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
  }
  /**
   * Generic function to create a protocol frame to write a string value to the fan.
   *
   * @param data The data to write with necessary fan data as well.
   * @param writeStringMethod The function from the OxxifyProtocol class, which adds the data to write.
   */
  WriteStringFanData(data, writeStringMethod) {
    this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
    writeStringMethod(String(data.value));
    this.oxxify.FinishFrame();
    const packet = this.oxxify.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
  }
  /**
   * Generic function to create a protocol frame to write a bool value to the fan.
   *
   * @param data The data to write with necessary fan data as well.
   * @param writeStringMethod The function from the OxxifyProtocol class, which adds the data to write.
   */
  WriteBoolFanData(data, writeStringMethod) {
    if (typeof data.value !== "boolean") {
      this.log.warn(`The value is not from type boolean.`);
      return;
    }
    this.oxxify.StartNewFrame(data.strFanId, data.fanData.strPassword);
    writeStringMethod(Boolean(data.value));
    this.oxxify.FinishFrame();
    const packet = this.oxxify.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
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
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, data.fanData.strIpAddress));
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
            this.sendQuene.enqueue(new import_ModelData.DataToSend(packet2, fanData.strIpAddress));
            this.clearTimeout(timeout);
          }, 1e3);
        }
      });
    }).catch((reason) => {
      this.log.error(reason);
    });
  }
  //#region Protected data members
  udpServer;
  oxxify = new Oxxify.OxxifyProtocol();
  sendQuene = new import_queue_fifo.default();
  queneInterval;
  pollingInterval;
  ntpClient = new NTP.Client();
  //#endregion
}
if (require.main !== module) {
  module.exports = (options) => new OxxifyFanControl(options);
} else {
  (() => new OxxifyFanControl())();
}
//# sourceMappingURL=main.js.map
