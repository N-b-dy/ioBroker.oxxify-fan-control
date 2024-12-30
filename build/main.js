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
    const dataDictionary = this.protocolBuilder.DataDictionary;
    this.config.fans.forEach(async (element) => {
      this.log.debug('Fan configured: "' + element.name + '": ' + element.id + " - " + element.ipaddr);
      await this.extendObject("devices." + element.id, {
        type: "channel",
        common: {
          name: element.name,
          role: void 0
        }
      });
      dataDictionary.forEach(async (value) => {
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
      this.log.error("Error: " + error);
      this.udpServer.close();
    });
    this.udpServer.on("message", async (msg, info) => {
      await this.setState("info.connection", true, true);
      this.log.silly(
        `Received ${msg.length} bytes from ${info.address}:${info.port} - Data: ${msg.toString("hex")}`
      );
      const data = this.protocolBuilder.ParseResponseData(msg);
      if (data.receivedData.length > 0) {
        data.receivedData.forEach(async (value) => {
          await this.setState("devices." + data.strFanId + "." + value.strIdentifer, value.value, true);
        });
      }
    });
    this.udpServer.bind(4001);
    this.udpServer.on("listening", async () => {
      const address = this.udpServer.address();
      const port = address.port;
      const family = address.family;
      const ipaddr = address.address;
      this.log.debug("Server is listening at: " + ipaddr + ":" + port + " (" + family + ")");
      this.ReadAllFanData(true);
    });
    this.udpServer.on("close", () => {
      this.log.warn("Socket is closed");
    });
    this.queneInterval = this.setInterval(() => {
      if (this.sendQuene.isEmpty() == false) {
        const sendData = this.sendQuene.dequeue();
        if (sendData != null) {
          this.log.silly(
            "Sending " + sendData.data.toString("hex") + " to " + sendData.ipAddress + ":4000"
          );
          this.udpServer.send(sendData.data, 4e3, sendData.ipAddress, (err) => {
            if (err != null)
              this.log.error(err.message);
          });
        }
      }
    }, 25);
    this.pollingInterval = this.setInterval(() => {
      this.ReadAllFanData(false);
    }, this.config.pollingInterval * 1e3);
  }
  /**
   * Is called when adapter shuts down - callback has to be called under any circumstances!
   */
  onUnload(callback) {
    try {
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
  onStateChange(strStateIdentifier, state) {
    if (state) {
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
      this.log.info(`state ${strStateIdentifier} deleted`);
    }
  }
  ReadAllFanData(bIncludeConstData) {
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
      this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, element.ipaddr));
    });
  }
  ParseFanId(strId) {
    const strFanIdRegex = "[0-9A-Fa-f]{16}";
    const match = strId.match(strFanIdRegex);
    if (match) {
      return match.toString();
    }
    return void 0;
  }
  GetFanDataFromConfig(strFanId) {
    const data = this.config.fans.find((f) => f.id == strFanId);
    if (data == void 0)
      return void 0;
    return { strIpAddress: data.ipaddr, strPassword: data.password };
  }
  WriteBoostModeFollowUpTime(strFanId, fanData, value) {
    if (typeof value !== "number") {
      this.log.warn("The value is not from type number.");
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteBoostModeFollowUpTime(Number(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteOperatingMode(strFanId, fanData, value) {
    const nValue = this.ParseInputNumber(value);
    if (isNaN(nValue))
      return;
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteOperatingMode(nValue);
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteFanSpeedMode(strFanId, fanData, value) {
    const nValue = this.ParseInputNumber(value);
    if (isNaN(nValue))
      return;
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteFanSpeedMode(nValue);
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteFanState(strFanId, fanData, value) {
    if (typeof value !== "boolean") {
      this.log.warn(`The value is not from type boolean.`);
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteFanState(Boolean(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteManualFanSpeed(strFanId, fanData, value) {
    if (typeof value !== "number") {
      this.log.warn("The value is not from type number.");
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteManualFanSpeed(Number(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  ResetFilterExchangeCountdown(strFanId, fanData) {
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteResetFilterExchangeCountdown();
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteTimeControlledMode(strFanId, fanData, value) {
    if (typeof value !== "boolean") {
      this.log.warn(`The value is not from type boolean.`);
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteTimeControlledMode(Boolean(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteTimerMode(strFanId, fanData, value) {
    const nValue = this.ParseInputNumber(value);
    if (isNaN(nValue))
      return;
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteTimerMode(nValue);
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteAnalogVoltageSensorState(strFanId, fanData, value) {
    if (typeof value !== "boolean") {
      this.log.warn(`The value is not from type boolean.`);
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteAnalogVoltageSensorState(Boolean(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteHumiditySensorState(strFanId, fanData, value) {
    if (typeof value !== "boolean") {
      this.log.warn(`The value is not from type boolean.`);
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteHumiditySensorState(Boolean(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteRelaisSensorState(strFanId, fanData, value) {
    if (typeof value !== "boolean") {
      this.log.warn(`The value is not from type boolean.`);
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteRelaisSensorState(Boolean(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteTargetAnalogVoltageValue(strFanId, fanData, value) {
    if (typeof value !== "number") {
      this.log.warn(`The value is not from type number.`);
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteTargetAnalogVoltageValue(Number(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  WriteTargetHumidityValue(strFanId, fanData, value) {
    if (typeof value !== "number") {
      this.log.warn(`The value is not from type number.`);
      return;
    }
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteTargetHumidityValue(Number(value));
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  ResetAlarms(strFanId, fanData) {
    this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
    this.protocolBuilder.WriteResetAlarmState();
    this.protocolBuilder.FinishFrame();
    const packet = this.protocolBuilder.ProtocolPacket;
    this.sendQuene.enqueue(new import_ModelData.DataToSend(packet, fanData.strIpAddress));
  }
  SyncRtcClock(strFanId, fanData) {
    this.ntpClient.syncTime().then((value) => {
      const dateTime = DateTime.parse(value.time.toISOString(), "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]", true);
      this.log.debug("Received local time via ntp: " + dateTime.toLocaleString());
      this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
      this.protocolBuilder.WriteRtcDateTime(dateTime);
      this.protocolBuilder.FinishFrame();
      const packet = this.protocolBuilder.ProtocolPacket;
      this.udpServer.send(packet, 4e3, fanData.strIpAddress, (err) => {
        if (err != null) {
          this.log.error(err.message);
        } else {
          this.protocolBuilder.StartNewFrame(strFanId, fanData.strPassword);
          this.protocolBuilder.ReadRtcDateTime();
          this.protocolBuilder.FinishFrame();
          const packet2 = this.protocolBuilder.ProtocolPacket;
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
  ParseInputNumber(value) {
    if (typeof value !== "number" && typeof value !== "string") {
      this.log.warn(`The value is not from type number or string, but ${typeof value}`);
      return NaN;
    }
    let nValue = Number(value);
    if (typeof value === "string") {
      nValue = parseInt(value);
      if (isNaN(nValue))
        nValue = parseInt(String(value).substring(0, String(value).indexOf(" ")));
      if (isNaN(nValue)) {
        this.log.warn(`Unable to parse the number from the input value: ${value}`);
      }
    }
    return nValue;
  }
  //#region Protected data members
  udpServer;
  protocolBuilder = new Oxxify.OxxifyProtocol();
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
