"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var OxxifyProtocol_exports = {};
__export(OxxifyProtocol_exports, {
  FanData: () => FanData,
  OxxifyProtocol: () => OxxifyProtocol,
  ParameterType: () => ParameterType
});
module.exports = __toCommonJS(OxxifyProtocol_exports);
var import_ModelData = require("./ModelData");
var FunctionType = /* @__PURE__ */ ((FunctionType2) => {
  FunctionType2[FunctionType2["Undefined"] = 0] = "Undefined";
  FunctionType2[FunctionType2["Read"] = 1] = "Read";
  FunctionType2[FunctionType2["WriteRead"] = 3] = "WriteRead";
  FunctionType2[FunctionType2["Response"] = 6] = "Response";
  return FunctionType2;
})(FunctionType || {});
var ParameterType = /* @__PURE__ */ ((ParameterType2) => {
  ParameterType2[ParameterType2["FanState"] = 1] = "FanState";
  ParameterType2[ParameterType2["FanSpeedMode"] = 2] = "FanSpeedMode";
  ParameterType2[ParameterType2["BoostState"] = 6] = "BoostState";
  ParameterType2[ParameterType2["TimerMode"] = 7] = "TimerMode";
  ParameterType2[ParameterType2["TimerCountdown"] = 11] = "TimerCountdown";
  ParameterType2[ParameterType2["StateHumiditySensor"] = 15] = "StateHumiditySensor";
  ParameterType2[ParameterType2["StateRelaisSensor"] = 20] = "StateRelaisSensor";
  ParameterType2[ParameterType2["StateAnalogVoltageSensor"] = 22] = "StateAnalogVoltageSensor";
  ParameterType2[ParameterType2["TargetHumidityValue"] = 25] = "TargetHumidityValue";
  ParameterType2[ParameterType2["RtcBatteryVoltage"] = 36] = "RtcBatteryVoltage";
  ParameterType2[ParameterType2["CurrentHumidityValue"] = 37] = "CurrentHumidityValue";
  ParameterType2[ParameterType2["CurrentAnalogVoltageValue"] = 45] = "CurrentAnalogVoltageValue";
  ParameterType2[ParameterType2["CurrentRelaisValue"] = 50] = "CurrentRelaisValue";
  ParameterType2[ParameterType2["ManualFanSpeed"] = 68] = "ManualFanSpeed";
  ParameterType2[ParameterType2["FanSpeedFan1Rpm"] = 74] = "FanSpeedFan1Rpm";
  ParameterType2[ParameterType2["FanSpeedFan2Rpm"] = 75] = "FanSpeedFan2Rpm";
  ParameterType2[ParameterType2["FilterExchangeCountdown"] = 100] = "FilterExchangeCountdown";
  ParameterType2[ParameterType2["ResetFilterExchangeCountdown"] = 101] = "ResetFilterExchangeCountdown";
  ParameterType2[ParameterType2["BoostModeFollowUpTime"] = 102] = "BoostModeFollowUpTime";
  ParameterType2[ParameterType2["TriggerTimeSync"] = 256] = "TriggerTimeSync";
  ParameterType2[ParameterType2["RtcTime"] = 111] = "RtcTime";
  ParameterType2[ParameterType2["RtcDate"] = 112] = "RtcDate";
  ParameterType2[ParameterType2["TimeControlledMode"] = 114] = "TimeControlledMode";
  ParameterType2[ParameterType2["TimeControlSchedule"] = 119] = "TimeControlSchedule";
  ParameterType2[ParameterType2["SearchFanId"] = 124] = "SearchFanId";
  ParameterType2[ParameterType2["FanPassword"] = 125] = "FanPassword";
  ParameterType2[ParameterType2["OperatingTime"] = 126] = "OperatingTime";
  ParameterType2[ParameterType2["ResetAlarms"] = 128] = "ResetAlarms";
  ParameterType2[ParameterType2["AlarmState"] = 131] = "AlarmState";
  ParameterType2[ParameterType2["CloudServerEnabled"] = 133] = "CloudServerEnabled";
  ParameterType2[ParameterType2["FirmwareVersionAndDate"] = 134] = "FirmwareVersionAndDate";
  ParameterType2[ParameterType2["ResetFactoryDefaults"] = 135] = "ResetFactoryDefaults";
  ParameterType2[ParameterType2["FilterExchangeNecessary"] = 136] = "FilterExchangeNecessary";
  ParameterType2[ParameterType2["WifiOperatingMode"] = 148] = "WifiOperatingMode";
  ParameterType2[ParameterType2["WifiName"] = 149] = "WifiName";
  ParameterType2[ParameterType2["WifiPassword"] = 150] = "WifiPassword";
  ParameterType2[ParameterType2["WifiEncryptionMode"] = 153] = "WifiEncryptionMode";
  ParameterType2[ParameterType2["WifiChannel"] = 154] = "WifiChannel";
  ParameterType2[ParameterType2["WifiIpMode"] = 155] = "WifiIpMode";
  ParameterType2[ParameterType2["WifiIp"] = 156] = "WifiIp";
  ParameterType2[ParameterType2["WifiSubnetMask"] = 157] = "WifiSubnetMask";
  ParameterType2[ParameterType2["WifiGateway"] = 158] = "WifiGateway";
  ParameterType2[ParameterType2["ExitWifiSetupAndSafe"] = 160] = "ExitWifiSetupAndSafe";
  ParameterType2[ParameterType2["ExitWifiSetupAndDiscard"] = 162] = "ExitWifiSetupAndDiscard";
  ParameterType2[ParameterType2["CurrentWifiIp"] = 163] = "CurrentWifiIp";
  ParameterType2[ParameterType2["FanOperatingMode"] = 183] = "FanOperatingMode";
  ParameterType2[ParameterType2["TargetAnalogVoltageValue"] = 184] = "TargetAnalogVoltageValue";
  ParameterType2[ParameterType2["FanType"] = 185] = "FanType";
  return ParameterType2;
})(ParameterType || {});
class FanData {
  constructor(nSize, strIdentifer, bIsWritable, strRole, strType, name, parseFunction, strUnit, minValue, maxValue) {
    this.nSize = nSize;
    this.strIdentifer = strIdentifer;
    this.bIsWritable = bIsWritable;
    this.strRole = strRole;
    this.strType = strType;
    this.strUnit = strUnit;
    this.name = name;
    this.parseFunction = parseFunction;
    this.minValue = minValue;
    this.maxValue = maxValue;
  }
  nSize;
  strIdentifer;
  bIsWritable;
  strRole;
  strType;
  name;
  parseFunction;
  strUnit;
  minValue;
  maxValue;
}
class OxxifyProtocol {
  constructor() {
    this.internalBuffer[0] = 253;
    this.internalBuffer[1] = 253;
    this.internalBuffer[2] = 2;
    this.internalBuffer[3] = 16;
    this.nWriteIndex = 4;
    this.FillParameterDictionary();
  }
  StartNewFrame(strFanId, strPassword) {
    if (strFanId.length != 16)
      return false;
    if (strPassword.length <= 0)
      return false;
    this.nWriteIndex = 4;
    this.internalBuffer.write(strFanId, this.nWriteIndex);
    this.nWriteIndex += strFanId.length;
    this.internalBuffer[this.nWriteIndex] = strPassword.length;
    this.nWriteIndex++;
    this.internalBuffer.write(strPassword, this.nWriteIndex);
    this.nWriteIndex += strPassword.length;
    this.eCurrentFunction = 0 /* Undefined */;
    this.bIsFirstFunction = true;
    return true;
  }
  FinishFrame() {
    const checksum = this.CalculateChecksum(this.internalBuffer.subarray(2, this.nWriteIndex));
    this.internalBuffer[this.nWriteIndex] = checksum & 255;
    this.nWriteIndex++;
    this.internalBuffer[this.nWriteIndex] = checksum >> 8;
    this.nWriteIndex++;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  ReadFanState() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(1 /* FanState */);
  }
  WriteFanState(bEnabled) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    if (bEnabled)
      data[0] = 1;
    else
      data[0] = 0;
    this.AddParameter(1 /* FanState */, data);
  }
  ReadFanSpeedMode() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(2 /* FanSpeedMode */);
  }
  WriteFanSpeedMode(nValue) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    data[0] = nValue;
    console.log("Data in Buffer: " + data[0]);
    this.AddParameter(2 /* FanSpeedMode */, data);
  }
  ReadBoostState() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(6 /* BoostState */);
  }
  ReadTimerModeValues() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(7 /* TimerMode */);
    this.AddParameter(11 /* TimerCountdown */);
  }
  WriteTimerMode(nValue) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    data[0] = nValue;
    this.AddParameter(7 /* TimerMode */, data);
  }
  ReadHumiditySensorState() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(15 /* StateHumiditySensor */);
  }
  WriteHumiditySensorState(bEnabled) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    if (bEnabled)
      data[0] = 1;
    else
      data[0] = 0;
    this.AddParameter(15 /* StateHumiditySensor */, data);
  }
  ReadRelaisSensorState() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(20 /* StateRelaisSensor */);
  }
  WriteRelaisSensorState(bEnabled) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    if (bEnabled)
      data[0] = 1;
    else
      data[0] = 0;
    this.AddParameter(20 /* StateRelaisSensor */, data);
  }
  ReadAnalogVoltageSensorState() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(22 /* StateAnalogVoltageSensor */);
  }
  WriteAnalogVoltageSensorState(bEnabled) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    if (bEnabled)
      data[0] = 1;
    else
      data[0] = 0;
    this.AddParameter(22 /* StateAnalogVoltageSensor */, data);
  }
  ReadTargetHumidityValue() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(25 /* TargetHumidityValue */);
  }
  WriteTargetHumidityValue(nValue) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    data[0] = nValue;
    this.AddParameter(25 /* TargetHumidityValue */, data);
  }
  ReadRtcBattery() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(36 /* RtcBatteryVoltage */);
  }
  ReadCurrentHumidity() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(37 /* CurrentHumidityValue */);
  }
  ReadCurrentAnalogVoltage() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(45 /* CurrentAnalogVoltageValue */);
  }
  ReadCurrentRelaisState() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(50 /* CurrentRelaisValue */);
  }
  ReadManualFanSpeed() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(68 /* ManualFanSpeed */);
  }
  WriteManualFanSpeed(nValue) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    data[0] = nValue;
    this.AddParameter(68 /* ManualFanSpeed */, data);
  }
  ReadFan1Speed() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(74 /* FanSpeedFan1Rpm */);
  }
  ReadFan2Speed() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(75 /* FanSpeedFan2Rpm */);
  }
  ReadFilterExchangeCountdown() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(100 /* FilterExchangeCountdown */);
  }
  WriteResetFilterExchangeCountdown() {
    this.AddFunctionCode(3 /* WriteRead */);
    const resetByte = Buffer.alloc(1);
    resetByte[0] = 255;
    this.AddParameter(101 /* ResetFilterExchangeCountdown */, resetByte);
  }
  ReadBoostModeFollowUpTime() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(102 /* BoostModeFollowUpTime */);
  }
  WriteBoostModeFollowUpTime(nValue) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    data[0] = nValue;
    this.AddParameter(102 /* BoostModeFollowUpTime */, data);
  }
  ReadRtcDateTime() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(111 /* RtcTime */);
    this.AddParameter(112 /* RtcDate */);
  }
  WriteRtcDateTime(dateTime) {
    this.AddFunctionCode(3 /* WriteRead */);
    const rtcTime = Buffer.alloc(3);
    rtcTime[0] = dateTime.getSeconds();
    rtcTime[1] = dateTime.getMinutes();
    rtcTime[2] = dateTime.getHours();
    const rtcDate = Buffer.alloc(4);
    rtcDate[0] = dateTime.getDate();
    rtcDate[1] = dateTime.getDay();
    rtcDate[2] = dateTime.getMonth() + 1;
    rtcDate[3] = dateTime.getFullYear() % 100;
    this.AddParameter(111 /* RtcTime */, rtcTime);
    this.AddParameter(112 /* RtcDate */, rtcDate);
    return true;
  }
  ReadTimeControlledMode() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(114 /* TimeControlledMode */);
  }
  WriteTimeControlledMode(bEnabled) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    if (bEnabled)
      data[0] = 1;
    else
      data[0] = 0;
    this.AddParameter(114 /* TimeControlledMode */, data);
  }
  ReadOperatingTime() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(126 /* OperatingTime */);
  }
  ReadAlarmState() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(131 /* AlarmState */);
  }
  WriteResetAlarmState() {
    this.AddFunctionCode(3 /* WriteRead */);
    const resetAlarmByte = Buffer.alloc(1);
    resetAlarmByte[0] = 255;
    this.AddParameter(128 /* ResetAlarms */, resetAlarmByte);
  }
  ReadCloudServerEnabled() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(133 /* CloudServerEnabled */);
  }
  ReadFirmware() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(134 /* FirmwareVersionAndDate */);
  }
  ReadFilterExchangeNecessary() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(136 /* FilterExchangeNecessary */);
  }
  ReadWifiData() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(148 /* WifiOperatingMode */);
    this.AddParameter(149 /* WifiName */);
    this.AddParameter(150 /* WifiPassword */);
    this.AddParameter(153 /* WifiEncryptionMode */);
    this.AddParameter(154 /* WifiChannel */);
    this.AddParameter(155 /* WifiIpMode */);
    this.AddParameter(156 /* WifiIp */);
    this.AddParameter(157 /* WifiSubnetMask */);
    this.AddParameter(158 /* WifiGateway */);
    this.AddParameter(163 /* CurrentWifiIp */);
  }
  ReadOperatingMode() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(183 /* FanOperatingMode */);
  }
  WriteOperatingMode(nValue) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    data[0] = nValue;
    this.AddParameter(183 /* FanOperatingMode */, data);
  }
  ReadTargetAnalogVoltageValue() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(184 /* TargetAnalogVoltageValue */);
  }
  WriteTargetAnalogVoltageValue(nValue) {
    this.AddFunctionCode(3 /* WriteRead */);
    const data = Buffer.alloc(1);
    data[0] = nValue;
    this.AddParameter(184 /* TargetAnalogVoltageValue */, data);
  }
  ReadFanType() {
    this.AddFunctionCode(1 /* Read */);
    this.AddParameter(185 /* FanType */);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  get ProtocolPacket() {
    return Buffer.from(this.internalBuffer.subarray(0, this.nWriteIndex));
  }
  ParseResponseData(dataBytes) {
    var _a;
    const status = this.CheckProtocol(dataBytes);
    const result = new import_ModelData.ParsedData();
    if (dataBytes == void 0) {
      result.status = import_ModelData.ParsingStatus.Undefined;
      return result;
    }
    if (status != import_ModelData.ParsingStatus.Ok) {
      result.status = status;
      return result;
    }
    this.nReadIndex = 4;
    result.strFanId = dataBytes.subarray(this.nReadIndex, this.nReadIndex + 16).toString();
    this.nReadIndex += 16;
    this.nReadIndex += (_a = dataBytes.at(this.nReadIndex)) != null ? _a : 0;
    this.nReadIndex++;
    let bIsDataToRead = false;
    if (dataBytes.at(this.nReadIndex) == 6 /* Response */) {
      bIsDataToRead = true;
    }
    this.nReadIndex++;
    if (bIsDataToRead) {
      while (this.nReadIndex < dataBytes.length - 2) {
        this.nReadIndex += this.ParseData(dataBytes.subarray(this.nReadIndex), result.receivedData);
      }
      return result;
    }
    result.status = import_ModelData.ParsingStatus.Undefined;
    return result;
  }
  ParseData(data, receivedData) {
    var _a, _b, _c;
    let nIndex = 0;
    let nCurrentReadParameterSize = 1;
    switch (data.at(nIndex)) {
      case 254:
        nIndex++;
        nCurrentReadParameterSize = (_a = data.at(nIndex)) != null ? _a : 1;
        nIndex++;
        break;
      case 253:
        nIndex++;
        nIndex++;
        break;
    }
    const eParameter = data.at(nIndex);
    nIndex++;
    if (this.parameterDictionary.has(eParameter)) {
      const fanData = this.parameterDictionary.get(eParameter);
      if (fanData != void 0) {
        const parsedData = new import_ModelData.ReceivedData();
        parsedData.strIdentifer = (_b = fanData == null ? void 0 : fanData.strIdentifer) != null ? _b : "UNDEFINED";
        parsedData.value = (_c = fanData == null ? void 0 : fanData.parseFunction(data.subarray(nIndex, nIndex + nCurrentReadParameterSize))) != null ? _c : null;
        receivedData.push(parsedData);
      }
    }
    const nReturnIndex = nIndex + nCurrentReadParameterSize;
    return nReturnIndex;
  }
  get DataDictionary() {
    return this.parameterDictionary;
  }
  //#region Protected data members
  internalBuffer = Buffer.alloc(256);
  nWriteIndex = 0;
  nReadIndex = 0;
  bIsFirstFunction = false;
  eCurrentFunction = 0 /* Undefined */;
  // Dictionary with parameter low byte as key for the HighByte 0x00
  parameterDictionary = /* @__PURE__ */ new Map();
  //#endregion
  CheckProtocol(dataBuffer) {
    if (dataBuffer.at(0) != 253 && dataBuffer.at(1) != 253) {
      return import_ModelData.ParsingStatus.WrongHeader;
    }
    if (dataBuffer.at(2) != 2) {
      return import_ModelData.ParsingStatus.WrongVersion;
    }
    if (dataBuffer.at(3) != 16) {
      return import_ModelData.ParsingStatus.WrongIdSize;
    }
    const nCalculatedChecksum = this.CalculateChecksum(dataBuffer.subarray(2, dataBuffer.length - 2));
    const nReceivedChecksum = dataBuffer[dataBuffer.length - 2] + (dataBuffer[dataBuffer.length - 1] << 8);
    if (nCalculatedChecksum != nReceivedChecksum) {
      return import_ModelData.ParsingStatus.ChecksumError;
    }
    return import_ModelData.ParsingStatus.Ok;
  }
  AddFunctionCode(eNextFunction) {
    if (this.bIsFirstFunction) {
      this.bIsFirstFunction = false;
    } else {
      if (eNextFunction == this.eCurrentFunction) {
        return;
      } else {
        this.internalBuffer[this.nWriteIndex] = 252;
        this.nWriteIndex++;
      }
    }
    this.internalBuffer[this.nWriteIndex] = eNextFunction;
    this.nWriteIndex++;
    this.eCurrentFunction = eNextFunction;
  }
  /**
   * Adds an parameter for an read or an write request.
   * @param eParameter The predefined enum value for the parameter, which is also teh relevant low-byte of the adressed data.
   * @param bytes The bytes to write in a Write / WriteRead request. Null in case of an read request.
   * @returns True if successful, otherwise false.
   */
  AddParameter(eParameter, bytes = null) {
    var _a;
    const parameterData = this.parameterDictionary.get(eParameter);
    if (parameterData == void 0)
      return false;
    if (parameterData.nSize != 1) {
      if (this.eCurrentFunction != 1 /* Read */) {
        this.internalBuffer[this.nWriteIndex] = 254;
        this.nWriteIndex++;
        this.internalBuffer[this.nWriteIndex] = parameterData.nSize;
        this.nWriteIndex++;
      }
    }
    this.internalBuffer[this.nWriteIndex] = eParameter;
    this.nWriteIndex++;
    if (this.eCurrentFunction == 3 /* WriteRead */) {
      if (bytes == null)
        return false;
      if (bytes.length == 1)
        this.internalBuffer.writeUint8((_a = bytes.at(0)) != null ? _a : 0, this.nWriteIndex);
      else
        this.internalBuffer.write(bytes.toString(), this.nWriteIndex);
      this.nWriteIndex += bytes.length;
    }
    return true;
  }
  CalculateChecksum(bytes) {
    let checksum = 0;
    for (let i = 0; i < bytes.length; i++) {
      checksum += bytes[i];
    }
    return checksum & 65535;
  }
  ParseFirmware(bytes) {
    var _a, _b;
    const nYear = ((_a = bytes.at(4)) != null ? _a : 0) + (((_b = bytes.at(5)) != null ? _b : 0) << 8);
    return `v${bytes.at(0)}.${bytes.at(1)} - ${bytes.at(2)}.${bytes.at(3)}.${nYear}`;
  }
  ParseBool(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 0:
        return false;
      case 1:
        return true;
      default:
        break;
    }
    return null;
  }
  ParseByteNumber(byte) {
    var _a;
    return (_a = byte.at(0)) != null ? _a : null;
  }
  ParseWordNumber(bytes) {
    var _a, _b;
    return ((_a = bytes.at(0)) != null ? _a : 0) | ((_b = bytes.at(1)) != null ? _b : 0) << 8;
  }
  ParseTimerMode(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 0:
        return "0 - Off";
      case 1:
        return "1 - Night mode";
      case 2:
        return "2 - Party mode";
    }
    return null;
  }
  ParseFanSpeedMode(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 1:
        return "1 - Ventilation level 1";
      case 2:
        return "2 - Ventilation level 2";
      case 3:
        return "3 - Ventilation level 3";
      case 255:
        return "255 - Manual ventilation level";
    }
    return null;
  }
  ParseTimeSmallToLarge(bytes) {
    var _a, _b, _c;
    return `${(_a = bytes.at(2)) == null ? void 0 : _a.toString().padStart(2, "0")}:${(_b = bytes.at(1)) == null ? void 0 : _b.toString().padStart(2, "0")}:${(_c = bytes.at(0)) == null ? void 0 : _c.toString().padStart(2, "0")}`;
  }
  ParseRtcDate(bytes) {
    var _a, _b, _c;
    return `${(_a = bytes.at(0)) == null ? void 0 : _a.toString().padStart(2, "0")}.${(_b = bytes.at(2)) == null ? void 0 : _b.toString().padStart(2, "0")}.${(_c = bytes.at(3)) == null ? void 0 : _c.toString().padStart(2, "0")} (${bytes.at(1)} day of the week)`;
  }
  ParseOperatingTime(bytes) {
    var _a, _b, _c, _d;
    return `${((_a = bytes.at(2)) != null ? _a : 0) | ((_b = bytes.at(3)) != null ? _b : 0) << 8}:${(_c = bytes.at(1)) == null ? void 0 : _c.toString().padStart(2, "0")}:${(_d = bytes.at(0)) == null ? void 0 : _d.toString().padStart(2, "0")}`;
  }
  ParseAlarmWarningState(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 0:
        return "0 - Nothing";
      case 1:
        return "1 - Alarm (highest priority)";
      case 2:
        return "2 - Warning";
    }
    return null;
  }
  ParseWifiMode(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 1:
        return "1 - Client";
      case 2:
        return "2 - Access Point";
    }
    return null;
  }
  ParseText(bytes) {
    return bytes.toString();
  }
  ParseWifiEncryptionMode(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 48:
        return "48 - Open/not encrypted";
      case 50:
        return "50 - WPA PSK";
      case 51:
        return "51 - WPA2 PSK";
      case 52:
        return "52 - WPA/WPA2 PSK";
    }
    return null;
  }
  ParseWifiIpMode(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 0:
        return "0 - Static IP";
      case 1:
        return "1 - DHCP";
    }
    return null;
  }
  ParseIpV4Value(bytes) {
    return `${bytes.at(0)}.${bytes.at(1)}.${bytes.at(2)}.${bytes.at(3)}`;
  }
  ParseOperatingMode(byte) {
    var _a;
    switch ((_a = byte.at(0)) != null ? _a : 255) {
      case 0:
        return "0 - Ventilation";
      case 1:
        return "1 - Heat recovery";
      case 2:
        return "2 - Supply air";
    }
    return null;
  }
  ParseSystemType(bytes) {
    var _a;
    switch ((_a = bytes.at(0)) != null ? _a : 255) {
      case 14:
        return "14 - Oxxify.pro 50";
    }
    return null;
  }
  ParseNothing(byte) {
    byte;
    return null;
  }
  FillParameterDictionary() {
    this.parameterDictionary.set(
      1 /* FanState */,
      new FanData(
        1,
        "fan.fanState",
        true,
        "switch",
        "boolean",
        {
          en: "Fan On/Off",
          de: "L\xFCfter ein/aus",
          ru: "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435/\u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430",
          pt: "Ventilador ligado/desligado",
          nl: "Ventilator aan/uit",
          fr: "Ventilateur Marche/Arr\xEAt",
          it: "Ventola accesa/spenta",
          es: "Ventilador On/Off",
          pl: "Wentylator w\u0142.",
          uk: "\u0423\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043D\u044F/\u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043D\u044F \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430",
          "zh-cn": "Fan On/Off"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      2 /* FanSpeedMode */,
      new FanData(
        1,
        "fan.fanSpeedMode",
        true,
        "state",
        "string",
        {
          en: "Number of the ventilation level",
          de: "Nummer der L\xFCftungsstufe",
          ru: "\u041D\u043E\u043C\u0435\u0440 \u0443\u0440\u043E\u0432\u043D\u044F \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0438",
          pt: "N\xFAmero do n\xEDvel de ventila\xE7\xE3o",
          nl: "Nummer van het ventilatieniveau",
          fr: "Num\xE9ro du niveau de ventilation",
          it: "Numero del livello di ventilazione",
          es: "N\xFAmero del nivel de ventilaci\xF3n",
          pl: "Numer poziomu wentylacji",
          uk: "\u041D\u043E\u043C\u0435\u0440 \u0440\u0456\u0432\u043D\u044F \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0456\u0457",
          "zh-cn": "Number of the ventilation level"
        },
        this.ParseFanSpeedMode
      )
    );
    this.parameterDictionary.set(
      6 /* BoostState */,
      new FanData(
        1,
        "fan.boostState",
        false,
        "switch",
        "boolean",
        {
          en: "Boost operating status on/off",
          de: "Boost-Betriebszustand ein/aus",
          ru: "\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435/\u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0440\u0435\u0436\u0438\u043C\u0430 \u0440\u0430\u0431\u043E\u0442\u044B \u0431\u0443\u0441\u0442\u0430",
          pt: "Estado de funcionamento do Boost ligado/desligado",
          nl: "Bedrijfsstatus boost aan/uit",
          fr: "Activation/d\xE9sactivation de l'\xE9tat de fonctionnement de l'amplificateur",
          it: "Stato di funzionamento del boost on/off",
          es: "Estado de funcionamiento del Boost on/off",
          pl: "W\u0142\u0105czanie/wy\u0142\u0105czanie stanu pracy funkcji Boost",
          uk: "\u0423\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043D\u044F/\u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043D\u044F \u0440\u043E\u0431\u043E\u0447\u043E\u0433\u043E \u0441\u0442\u0430\u043D\u0443 \u043F\u0456\u0434\u0441\u0438\u043B\u044E\u0432\u0430\u0447\u0430",
          "zh-cn": "Boost operating status on/off"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      7 /* TimerMode */,
      new FanData(
        1,
        "fan.timerMode",
        true,
        "state",
        "mixed",
        {
          en: "Timer mode",
          de: "Timer-Modus",
          ru: "\u0420\u0435\u0436\u0438\u043C \u0442\u0430\u0439\u043C\u0435\u0440\u0430",
          pt: "Modo de temporizador",
          nl: "Timermodus",
          fr: "Mode minuterie",
          it: "Modalit\xE0 timer",
          es: "Modo temporizador",
          pl: "Tryb timera",
          uk: "\u0420\u0435\u0436\u0438\u043C \u0442\u0430\u0439\u043C\u0435\u0440\u0430",
          "zh-cn": "Timer mode"
        },
        this.ParseTimerMode,
        "",
        0,
        2
      )
    );
    this.parameterDictionary.set(
      11 /* TimerCountdown */,
      new FanData(
        3,
        "fan.timerCountDown",
        false,
        "value.time",
        "string",
        {
          en: "Current countdown of the timer operation",
          de: "Aktueller Countdown des Timerbetriebs",
          ru: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043E\u0442\u0441\u0447\u0435\u0442 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0440\u0430\u0431\u043E\u0442\u044B \u0442\u0430\u0439\u043C\u0435\u0440\u0430",
          pt: "Contagem decrescente atual da opera\xE7\xE3o do temporizador",
          nl: "Huidig aftellen van de timer",
          fr: "Compte \xE0 rebours actuel de l'op\xE9ration de minuterie",
          it: "Conto alla rovescia corrente del funzionamento del timer",
          es: "Cuenta atr\xE1s actual de la operaci\xF3n del temporizador",
          pl: "Bie\u017C\u0105ce odliczanie operacji timera",
          uk: "\u041F\u043E\u0442\u043E\u0447\u043D\u0438\u0439 \u0432\u0456\u0434\u043B\u0456\u043A \u0440\u043E\u0431\u043E\u0442\u0438 \u0442\u0430\u0439\u043C\u0435\u0440\u0430",
          "zh-cn": "Current countdown of the timer operation"
        },
        this.ParseTimeSmallToLarge,
        "hh:mm:ss"
      )
    );
    this.parameterDictionary.set(
      15 /* StateHumiditySensor */,
      new FanData(
        1,
        "sensors.stateHumiditySensor",
        true,
        "switch",
        "boolean",
        {
          en: "Status of the humidity sensor on/off",
          de: "Status des Feuchtigkeitssensors ein/aus",
          ru: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u0430\u0442\u0447\u0438\u043A\u0430 \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u0438 \u0432\u043A\u043B/\u0432\u044B\u043A\u043B",
          pt: "Estado do sensor de humidade ligado/desligado",
          nl: "Status van de vochtigheidssensor aan/uit",
          fr: "\xC9tat du capteur d'humidit\xE9 activ\xE9/d\xE9sactiv\xE9",
          it: "Stato del sensore di umidit\xE0 on/off",
          es: "Estado del sensor de humedad on/off",
          pl: "Stan w\u0142\u0105czenia/wy\u0142\u0105czenia czujnika wilgotno\u015Bci",
          uk: "\u0421\u0442\u0430\u043D \u0443\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043D\u044F/\u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043D\u044F \u0434\u0430\u0442\u0447\u0438\u043A\u0430 \u0432\u043E\u043B\u043E\u0433\u043E\u0441\u0442\u0456",
          "zh-cn": "Status of the humidity sensor on/off"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      20 /* StateRelaisSensor */,
      new FanData(
        1,
        "sensors.stateRelaisSensor",
        true,
        "switch",
        "boolean",
        {
          en: "Status of the relay sensor on/off",
          de: "Status des Relaissensors ein/aus",
          ru: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u0430\u0442\u0447\u0438\u043A\u0430 \u0440\u0435\u043B\u0435 \u0432\u043A\u043B/\u0432\u044B\u043A\u043B",
          pt: "Estado do sensor de rel\xE9 ligado/desligado",
          nl: "Status van de relaissensor aan/uit",
          fr: "\xC9tat du capteur de relais activ\xE9/d\xE9sactiv\xE9",
          it: "Stato del sensore a rel\xE8 on/off",
          es: "Estado del rel\xE9 sensor on/off",
          pl: "Stan w\u0142\u0105czonego/wy\u0142\u0105czonego czujnika przeka\u017Anika",
          uk: "\u0421\u0442\u0430\u043D \u0443\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043E\u0433\u043E/\u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043E\u0433\u043E \u0440\u0435\u043B\u0435\u0439\u043D\u043E\u0433\u043E \u0434\u0430\u0442\u0447\u0438\u043A\u0430",
          "zh-cn": "Status of the relay sensor on/off"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      22 /* StateAnalogVoltageSensor */,
      new FanData(
        1,
        "sensors.stateAnalogVoltageSensor",
        true,
        "switch",
        "boolean",
        {
          en: "Status of the analog voltage sensor on/off",
          de: "Status des analogen Spannungssensors ein/aus",
          ru: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0430\u043D\u0430\u043B\u043E\u0433\u043E\u0432\u043E\u0433\u043E \u0434\u0430\u0442\u0447\u0438\u043A\u0430 \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F \u0432\u043A\u043B/\u0432\u044B\u043A\u043B",
          pt: "Estado do sensor de tens\xE3o anal\xF3gico ligado/desligado",
          nl: "Status van de analoge spanningssensor aan/uit",
          fr: "\xC9tat du capteur de tension analogique activ\xE9/d\xE9sactiv\xE9",
          it: "Stato del sensore di tensione analogico on/off",
          es: "Estado del sensor anal\xF3gico de tensi\xF3n on/off",
          pl: "Stan w\u0142\u0105czenia/wy\u0142\u0105czenia analogowego czujnika napi\u0119cia",
          uk: "\u0421\u0442\u0430\u043D \u0443\u0432\u0456\u043C\u043A\u043D\u0435\u043D\u043D\u044F/\u0432\u0438\u043C\u043A\u043D\u0435\u043D\u043D\u044F \u0430\u043D\u0430\u043B\u043E\u0433\u043E\u0432\u043E\u0433\u043E \u0434\u0430\u0442\u0447\u0438\u043A\u0430 \u043D\u0430\u043F\u0440\u0443\u0433\u0438",
          "zh-cn": "Status of the analog voltage sensor on/off"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      25 /* TargetHumidityValue */,
      new FanData(
        1,
        "sensors.targetHumidityValue",
        true,
        "level.humidity",
        "number",
        {
          en: "Humidity setpoint",
          de: "Sollwert der Luftfeuchtigkeit",
          ru: "\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u0438",
          pt: "Ponto de regula\xE7\xE3o da humidade",
          nl: "Vochtigheid instelpunt",
          fr: "Consigne d'humidit\xE9",
          it: "Setpoint di umidit\xE0",
          es: "Consigna de humedad",
          pl: "Warto\u015B\u0107 zadana wilgotno\u015Bci",
          uk: "\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0432\u043E\u043B\u043E\u0433\u043E\u0441\u0442\u0456",
          "zh-cn": "Humidity setpoint"
        },
        this.ParseByteNumber,
        "%",
        40,
        80
      )
    );
    this.parameterDictionary.set(
      36 /* RtcBatteryVoltage */,
      new FanData(
        2,
        "system.rtcBatteryVoltage",
        false,
        "level.battery",
        "number",
        {
          en: "Current RTC battery voltage",
          de: "Aktuelle RTC-Batteriespannung",
          ru: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435 \u0431\u0430\u0442\u0430\u0440\u0435\u0438 RTC",
          pt: "Tens\xE3o atual da bateria RTC",
          nl: "Huidige RTC-batterijspanning",
          fr: "Tension actuelle de la pile RTC",
          it: "Tensione attuale della batteria RTC",
          es: "Tensi\xF3n actual de la bater\xEDa del RTC",
          pl: "Bie\u017C\u0105ce napi\u0119cie akumulatora RTC",
          uk: "\u041F\u043E\u0442\u043E\u0447\u043D\u0430 \u043D\u0430\u043F\u0440\u0443\u0433\u0430 \u0431\u0430\u0442\u0430\u0440\u0435\u0457 RTC",
          "zh-cn": "Current RTC battery voltage"
        },
        this.ParseWordNumber,
        "mV",
        0,
        5e3
      )
    );
    this.parameterDictionary.set(
      37 /* CurrentHumidityValue */,
      new FanData(
        1,
        "sensors.currentHumidityValue",
        false,
        "value.humidity",
        "number",
        {
          en: "Current humidity value",
          de: "Aktueller Feuchtigkeitswert",
          ru: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u0438",
          pt: "Valor atual da humidade",
          nl: "Huidige vochtigheidswaarde",
          fr: "Valeur actuelle de l'humidit\xE9",
          it: "Valore attuale dell'umidit\xE0",
          es: "Valor actual de humedad",
          pl: "Bie\u017C\u0105ca warto\u015B\u0107 wilgotno\u015Bci",
          uk: "\u041F\u043E\u0442\u043E\u0447\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0432\u043E\u043B\u043E\u0433\u043E\u0441\u0442\u0456",
          "zh-cn": "Current humidity value"
        },
        this.ParseByteNumber,
        "%",
        0,
        100
      )
    );
    this.parameterDictionary.set(
      45 /* CurrentAnalogVoltageValue */,
      new FanData(
        1,
        "sensors.currentAnalogVoltageValue",
        false,
        "value.voltage",
        "number",
        {
          en: "Current analog voltage value",
          de: "Aktueller analoger Spannungswert",
          ru: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0430\u043D\u0430\u043B\u043E\u0433\u043E\u0432\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F",
          pt: "Valor atual da tens\xE3o anal\xF3gica",
          nl: "Huidige analoge spanningswaarde",
          fr: "Valeur de la tension analogique actuelle",
          it: "Valore attuale della tensione analogica",
          es: "Valor de tensi\xF3n anal\xF3gica actual",
          pl: "Bie\u017C\u0105ca warto\u015B\u0107 napi\u0119cia analogowego",
          uk: "\u041F\u043E\u0442\u043E\u0447\u043D\u0435 \u0430\u043D\u0430\u043B\u043E\u0433\u043E\u0432\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u043D\u0430\u043F\u0440\u0443\u0433\u0438",
          "zh-cn": "Current analog voltage value"
        },
        this.ParseByteNumber,
        "%",
        0,
        100
      )
    );
    this.parameterDictionary.set(
      50 /* CurrentRelaisValue */,
      new FanData(
        1,
        "sensors.currentRelaisValue",
        false,
        "sensor",
        "boolean",
        {
          en: "Current value of the relay sensor",
          de: "Aktueller Wert des Relaissensors",
          ru: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0434\u0430\u0442\u0447\u0438\u043A\u0430 \u0440\u0435\u043B\u0435",
          pt: "Valor atual do sensor do rel\xE9",
          nl: "Huidige waarde van de relaissensor",
          fr: "Valeur actuelle du capteur relais",
          it: "Valore attuale del sensore a rel\xE8",
          es: "Valor actual del sensor del rel\xE9",
          pl: "Bie\u017C\u0105ca warto\u015B\u0107 czujnika przeka\u017Anika",
          uk: "\u041F\u043E\u0442\u043E\u0447\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0434\u0430\u0442\u0447\u0438\u043A\u0430 \u0440\u0435\u043B\u0435",
          "zh-cn": "Current value of the relay sensor"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      68 /* ManualFanSpeed */,
      new FanData(
        1,
        "fan.manualFanSpeed",
        true,
        "state",
        "number",
        {
          en: "Ventilation level of the fan in operation of the manual setting",
          de: "L\xFCftungsstufe des Gebl\xE4ses im Betrieb der manuellen Einstellung",
          ru: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0438 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u0440\u0443\u0447\u043D\u043E\u0439 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
          pt: "N\xEDvel de ventila\xE7\xE3o do ventilador em funcionamento da regula\xE7\xE3o manual",
          nl: "Ventilatieniveau van de ventilator bij gebruik van de handmatige instelling",
          fr: "Niveau de ventilation du ventilateur en mode manuel",
          it: "Livello di ventilazione del ventilatore in funzione dell'impostazione manuale",
          es: "Nivel de ventilaci\xF3n del ventilador en funcionamiento de ajuste manual",
          pl: "Poziom wentylacji wentylatora w trybie r\u0119cznym",
          uk: "\u0420\u0456\u0432\u0435\u043D\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0456\u0457 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 \u0432 \u0440\u0435\u0436\u0438\u043C\u0456 \u0440\u0443\u0447\u043D\u043E\u0433\u043E \u043D\u0430\u043B\u0430\u0448\u0442\u0443\u0432\u0430\u043D\u043D\u044F",
          "zh-cn": "Ventilation level of the fan in operation of the manual setting"
        },
        this.ParseByteNumber,
        "",
        0,
        255
      )
    );
    this.parameterDictionary.set(
      74 /* FanSpeedFan1Rpm */,
      new FanData(
        2,
        "fan.fanSpeedFan1Rpm",
        false,
        "state",
        "number",
        {
          en: "Ventilation level of fan no. 1",
          de: "L\xFCftungsstufe des Ventilators Nr. 1",
          ru: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0438 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 \u2116 1",
          pt: "N\xEDvel de ventila\xE7\xE3o do ventilador n.\xBA 1",
          nl: "Ventilatieniveau van ventilator nr. 1",
          fr: "Niveau de ventilation du ventilateur n\xB0 1",
          it: "Livello di ventilazione del ventilatore n. 1",
          es: "Nivel de ventilaci\xF3n del ventilador n\xBA 1",
          pl: "Poziom wentylacji wentylatora nr 1",
          uk: "\u0420\u0456\u0432\u0435\u043D\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0456\u0457 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 \u2116 1",
          "zh-cn": "Ventilation level of fan no. 1"
        },
        this.ParseWordNumber,
        "rpm"
      )
    );
    this.parameterDictionary.set(
      75 /* FanSpeedFan2Rpm */,
      new FanData(
        2,
        "fan.fanSpeedFan2Rpm",
        false,
        "state",
        "number",
        {
          en: "Ventilation level of fan no. 2",
          de: "L\xFCftungsstufe des Ventilators Nr. 2",
          ru: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0438 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 \u2116 2",
          pt: "N\xEDvel de ventila\xE7\xE3o do ventilador n.\xBA 2",
          nl: "Ventilatieniveau van ventilator nr. 2",
          fr: "Niveau de ventilation du ventilateur n\xB0 2",
          it: "Livello di ventilazione del ventilatore n. 2",
          es: "Nivel de ventilaci\xF3n del ventilador n\xBA 2",
          pl: "Poziom wentylacji wentylatora nr 2",
          uk: "\u0420\u0456\u0432\u0435\u043D\u044C \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0456\u0457 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430 \u2116 2",
          "zh-cn": "Ventilation level of fan no. 2"
        },
        this.ParseWordNumber,
        "rpm"
      )
    );
    this.parameterDictionary.set(
      100 /* FilterExchangeCountdown */,
      new FanData(
        3,
        "fan.filterExchangeCountdown",
        false,
        "state",
        "string",
        {
          en: "Countdown of the timer until filter change",
          de: "Countdown des Timers bis zum Filterwechsel",
          ru: "\u041E\u0442\u0441\u0447\u0435\u0442 \u0442\u0430\u0439\u043C\u0435\u0440\u0430 \u0434\u043E \u0437\u0430\u043C\u0435\u043D\u044B \u0444\u0438\u043B\u044C\u0442\u0440\u0430",
          pt: "Contagem decrescente do temporizador at\xE9 \xE0 mudan\xE7a do filtro",
          nl: "Aftellen van de timer tot filtervervanging",
          fr: "Compte \xE0 rebours jusqu'au remplacement du filtre",
          it: "Conto alla rovescia del timer fino alla sostituzione del filtro",
          es: "Cuenta atr\xE1s del temporizador hasta el cambio de filtro",
          pl: "Odliczanie czasu do wymiany filtra",
          uk: "\u0412\u0456\u0434\u043B\u0456\u043A \u0442\u0430\u0439\u043C\u0435\u0440\u0430 \u0434\u043E \u0437\u0430\u043C\u0456\u043D\u0438 \u0444\u0456\u043B\u044C\u0442\u0440\u0430",
          "zh-cn": "Countdown of the timer until filter change"
        },
        this.ParseTimeSmallToLarge,
        "dd:hh:mm"
      )
    );
    this.parameterDictionary.set(
      101 /* ResetFilterExchangeCountdown */,
      new FanData(
        1,
        "fan.resetFilterExchangeCountdown",
        true,
        "button",
        "boolean",
        {
          en: "Reset the timer countdown to the filter change",
          de: "Zur\xFCcksetzen des Timer-Countdowns f\xFCr den Filterwechsel",
          ru: "\u0421\u0431\u0440\u043E\u0441\u044C\u0442\u0435 \u0442\u0430\u0439\u043C\u0435\u0440, \u043E\u0442\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u0432\u0440\u0435\u043C\u044F \u0434\u043E \u0437\u0430\u043C\u0435\u043D\u044B \u0444\u0438\u043B\u044C\u0442\u0440\u0430",
          pt: "Reiniciar a contagem decrescente do temporizador para a mudan\xE7a do filtro",
          nl: "De timer voor het aftellen van de filtervervanging resetten",
          fr: "R\xE9initialiser le compte \xE0 rebours de la minuterie pour le remplacement du filtre",
          it: "Azzerare il conto alla rovescia del timer per la sostituzione del filtro",
          es: "Reinicia la cuenta atr\xE1s del temporizador para el cambio de filtro",
          pl: "Zresetuj licznik odliczaj\u0105cy czas do wymiany filtra",
          uk: "\u0421\u043A\u0438\u043D\u0443\u0442\u0438 \u0432\u0456\u0434\u043B\u0456\u043A \u0442\u0430\u0439\u043C\u0435\u0440\u0430 \u0434\u043E \u0437\u0430\u043C\u0456\u043D\u0438 \u0444\u0456\u043B\u044C\u0442\u0440\u0430",
          "zh-cn": "Reset the timer countdown to the filter change"
        },
        this.ParseNothing
      )
    );
    this.parameterDictionary.set(
      102 /* BoostModeFollowUpTime */,
      new FanData(
        1,
        "fan.boostModeFollowUpTime",
        true,
        "state",
        "number",
        {
          en: "Setpoint of the run-on time for boost mode",
          de: "Sollwert der Nachlaufzeit f\xFCr den Boostbetrieb",
          ru: "\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u0440\u0435\u0436\u0438\u043C\u0430 \u0444\u043E\u0440\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F",
          pt: "Ponto de regula\xE7\xE3o do tempo de arranque para o modo de impulso",
          nl: "Instelpunt van de aanlooptijd voor boostmodus",
          fr: "Point de consigne de la dur\xE9e de fonctionnement en mode boost",
          it: "Setpoint del tempo di funzionamento in modalit\xE0 boost",
          es: "Consigna del tiempo de marcha en inercia para el modo boost",
          pl: "Warto\u015B\u0107 zadana czasu rozruchu dla trybu do\u0142adowania",
          uk: "\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0447\u0430\u0441\u0443 \u0432\u0438\u0431\u0456\u0433\u0443 \u0434\u043B\u044F \u0440\u0435\u0436\u0438\u043C\u0443 \u043F\u0440\u0438\u0441\u043A\u043E\u0440\u0435\u043D\u043D\u044F",
          "zh-cn": "Setpoint of the run-on time for boost mode"
        },
        this.ParseByteNumber,
        "min",
        0,
        60
      )
    );
    this.parameterDictionary.set(
      256 /* TriggerTimeSync */,
      new FanData(
        0,
        "system.triggerRtcTimeSync",
        true,
        "button",
        "boolean",
        {
          en: "Synchronize time",
          de: "Zeit synchronisieren",
          ru: "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
          pt: "Sincronizar a hora",
          nl: "Tijd synchroniseren",
          fr: "Synchroniser l'heure",
          it: "Sincronizzare l'ora",
          es: "Sincronizar la hora",
          pl: "Synchronizacja czasu",
          uk: "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0456\u0437\u0443\u0432\u0430\u0442\u0438 \u0447\u0430\u0441",
          "zh-cn": "Synchronize time"
        },
        this.ParseNothing
      )
    );
    this.parameterDictionary.set(
      111 /* RtcTime */,
      new FanData(
        3,
        "system.rtcTime",
        false,
        "value.time",
        "string",
        {
          en: "RTC time",
          de: "RTC-Zeit",
          ru: "\u0412\u0440\u0435\u043C\u044F \u0420\u0422\u041A",
          pt: "Tempo RTC",
          nl: "RTC-tijd",
          fr: "Temps RTC",
          it: "Tempo RTC",
          es: "Hora RTC",
          pl: "Czas RTC",
          uk: "\u0427\u0430\u0441 \u0437\u0430 \u043A\u0438\u0457\u0432\u0441\u044C\u043A\u0438\u043C \u0447\u0430\u0441\u043E\u043C",
          "zh-cn": "RTC time"
        },
        this.ParseTimeSmallToLarge,
        "hh:mm:ss"
      )
    );
    this.parameterDictionary.set(
      112 /* RtcDate */,
      new FanData(
        4,
        "system.rtcCalendar",
        false,
        "value.date",
        "string",
        {
          en: "RTC calendar",
          de: "RTC-Kalender",
          ru: "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C \u0420\u0422\u041A",
          pt: "Calend\xE1rio RTC",
          nl: "RTC-kalender",
          fr: "Calendrier RTC",
          it: "Calendario RTC",
          es: "Calendario RTC",
          pl: "Kalendarz RTC",
          uk: "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440 RTC",
          "zh-cn": "RTC calendar"
        },
        this.ParseRtcDate,
        "dd.mm.yy"
      )
    );
    this.parameterDictionary.set(
      114 /* TimeControlledMode */,
      new FanData(
        1,
        "fan.timeControlledMode",
        true,
        "switch",
        "boolean",
        {
          en: "Time-controlled operation",
          de: "Zeitgesteuerter Betrieb",
          ru: "\u0420\u0430\u0431\u043E\u0442\u0430 \u0441 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0435\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438",
          pt: "Funcionamento com controlo de tempo",
          nl: "Tijdgestuurde werking",
          fr: "Fonctionnement \xE0 temps contr\xF4l\xE9",
          it: "Funzionamento a tempo",
          es: "Funcionamiento temporizado",
          pl: "Dzia\u0142anie sterowane czasem",
          uk: "\u0420\u0435\u0433\u0443\u043B\u044C\u043E\u0432\u0430\u043D\u0430 \u0437\u0430 \u0447\u0430\u0441\u043E\u043C \u0440\u043E\u0431\u043E\u0442\u0430",
          "zh-cn": "Time-controlled operation"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      126 /* OperatingTime */,
      new FanData(
        4,
        "system.operatingTime",
        false,
        "state",
        "string",
        {
          en: "Operating hours",
          de: "Betriebsstunden",
          ru: "\u0427\u0430\u0441\u044B \u0440\u0430\u0431\u043E\u0442\u044B",
          pt: "Horas de funcionamento",
          nl: "Bedrijfsuren",
          fr: "Heures de fonctionnement",
          it: "Orario di funzionamento",
          es: "Horas de funcionamiento",
          pl: "Godziny pracy",
          uk: "\u0413\u043E\u0434\u0438\u043D\u0438 \u0440\u043E\u0431\u043E\u0442\u0438",
          "zh-cn": "Operating hours"
        },
        this.ParseOperatingTime,
        "ddddd:hh:mm"
      )
    );
    this.parameterDictionary.set(
      128 /* ResetAlarms */,
      new FanData(
        1,
        "system.resetAlarms",
        true,
        "button",
        "boolean",
        {
          en: "Reset alarms",
          de: "Alarme zur\xFCcksetzen",
          ru: "\u0421\u0431\u0440\u043E\u0441 \u0441\u0438\u0433\u043D\u0430\u043B\u043E\u0432 \u0442\u0440\u0435\u0432\u043E\u0433\u0438",
          pt: "Repor alarmes",
          nl: "Reset alarmen",
          fr: "R\xE9initialisation des alarmes",
          it: "Ripristino degli allarmi",
          es: "Restablecer alarmas",
          pl: "Resetowanie alarm\xF3w",
          uk: "\u0421\u043A\u0438\u0434\u0430\u043D\u043D\u044F \u0442\u0440\u0438\u0432\u043E\u0433",
          "zh-cn": "Reset alarms"
        },
        this.ParseNothing
      )
    );
    this.parameterDictionary.set(
      131 /* AlarmState */,
      new FanData(
        1,
        "system.alarmState",
        false,
        "switch",
        "string",
        {
          en: "Alarm/warning display",
          de: "Alarm-/Warnungsanzeige",
          ru: "\u0418\u043D\u0434\u0438\u043A\u0430\u0446\u0438\u044F \u0441\u0438\u0433\u043D\u0430\u043B\u043E\u0432 \u0442\u0440\u0435\u0432\u043E\u0433\u0438/\u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0439",
          pt: "Indica\xE7\xE3o de alarme/aviso",
          nl: "Weergave alarm/waarschuwing",
          fr: "Affichage des alarmes et avertissements",
          it: "Display di allarme/avviso",
          es: "Indicaci\xF3n de alarma/aviso",
          pl: "Wy\u015Bwietlacz alarmu/ostrze\u017Cenia",
          uk: "\u0406\u043D\u0434\u0438\u043A\u0430\u0446\u0456\u044F \u0442\u0440\u0438\u0432\u043E\u0433\u0438/\u043F\u043E\u043F\u0435\u0440\u0435\u0434\u0436\u0435\u043D\u043D\u044F",
          "zh-cn": "Alarm/warning display"
        },
        this.ParseAlarmWarningState
      )
    );
    this.parameterDictionary.set(
      133 /* CloudServerEnabled */,
      new FanData(
        1,
        "network.cloudServerEnabled",
        false,
        "switch",
        "boolean",
        {
          en: "Approval of operation via cloud server",
          de: "Freigabe des Betriebs \xFCber Cloud-Server",
          ru: "\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u0447\u0435\u0440\u0435\u0437 \u043E\u0431\u043B\u0430\u0447\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0435\u0440",
          pt: "Aprova\xE7\xE3o da opera\xE7\xE3o atrav\xE9s do servidor em nuvem",
          nl: "Goedkeuring van werking via cloudserver",
          fr: "Approbation de l'op\xE9ration via un serveur en nuage",
          it: "Approvazione del funzionamento tramite server cloud",
          es: "Aprobaci\xF3n del funcionamiento a trav\xE9s del servidor en nube",
          pl: "Zatwierdzanie operacji za po\u015Brednictwem serwera w chmurze",
          uk: "\u0417\u0430\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F \u0440\u043E\u0431\u043E\u0442\u0438 \u0447\u0435\u0440\u0435\u0437 \u0445\u043C\u0430\u0440\u043D\u0438\u0439 \u0441\u0435\u0440\u0432\u0435\u0440",
          "zh-cn": "Approval of operation via cloud server"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      134 /* FirmwareVersionAndDate */,
      new FanData(
        6,
        "system.firmwareVersionAndDate",
        false,
        "info.firmware",
        "string",
        {
          en: "Firmware version and date of the control unit",
          de: "Firmware-Version und Datum des Steuerger\xE4ts",
          ru: "\u0412\u0435\u0440\u0441\u0438\u044F \u0438 \u0434\u0430\u0442\u0430 \u043F\u0440\u043E\u0448\u0438\u0432\u043A\u0438 \u0431\u043B\u043E\u043A\u0430 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F",
          pt: "Vers\xE3o e data do firmware da unidade de controlo",
          nl: "Firmwareversie en -datum van de besturingseenheid",
          fr: "Version et date du micrologiciel de l'unit\xE9 de contr\xF4le",
          it: "Versione e data del firmware della centralina",
          es: "Versi\xF3n y fecha del firmware de la unidad de control",
          pl: "Wersja i data oprogramowania uk\u0142adowego jednostki steruj\u0105cej",
          uk: "\u0412\u0435\u0440\u0441\u0456\u044F \u043F\u0440\u043E\u0448\u0438\u0432\u043A\u0438 \u0442\u0430 \u0434\u0430\u0442\u0430 \u0432\u0438\u043F\u0443\u0441\u043A\u0443 \u0431\u043B\u043E\u043A\u0443 \u0443\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u044F",
          "zh-cn": "Firmware version and date of the control unit"
        },
        this.ParseFirmware
      )
    );
    this.parameterDictionary.set(
      136 /* FilterExchangeNecessary */,
      new FanData(
        1,
        "fan.filterExchangeNecessary",
        false,
        "state",
        "boolean",
        {
          en: "Filter change indicator",
          de: "Filterwechselanzeige",
          ru: "\u0418\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u0437\u0430\u043C\u0435\u043D\u044B \u0444\u0438\u043B\u044C\u0442\u0440\u0430",
          pt: "Indicador de mudan\xE7a de filtro",
          nl: "Indicator voor filtervervanging",
          fr: "Indicateur de changement de filtre",
          it: "Indicatore di sostituzione del filtro",
          es: "Indicador de cambio de filtro",
          pl: "Wska\u017Anik wymiany filtra",
          uk: "\u0406\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u0437\u0430\u043C\u0456\u043D\u0438 \u0444\u0456\u043B\u044C\u0442\u0440\u0430",
          "zh-cn": "Filter change indicator"
        },
        this.ParseBool
      )
    );
    this.parameterDictionary.set(
      148 /* WifiOperatingMode */,
      new FanData(
        1,
        "network.wifiOperatingMode",
        false,
        "state",
        "string",
        {
          en: "WLAN operation mode",
          de: "WLAN-Betriebsart",
          ru: "\u0420\u0435\u0436\u0438\u043C \u0440\u0430\u0431\u043E\u0442\u044B WLAN",
          pt: "Modo de funcionamento WLAN",
          nl: "WLAN-bedieningsmodus",
          fr: "Mode de fonctionnement WLAN",
          it: "Modalit\xE0 di funzionamento WLAN",
          es: "Modo de funcionamiento WLAN",
          pl: "Tryb pracy WLAN",
          uk: "\u0420\u0435\u0436\u0438\u043C \u0440\u043E\u0431\u043E\u0442\u0438 WLAN",
          "zh-cn": "WLAN operation mode"
        },
        this.ParseWifiMode
      )
    );
    this.parameterDictionary.set(
      149 /* WifiName */,
      new FanData(
        -1,
        "network.wifiName",
        false,
        "state",
        "string",
        {
          en: "WLAN name in client mode",
          de: "WLAN-Name im Client-Modus",
          ru: "\u0418\u043C\u044F \u0431\u0435\u0441\u043F\u0440\u043E\u0432\u043E\u0434\u043D\u043E\u0439 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0435\u0442\u0438 \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u043A\u043B\u0438\u0435\u043D\u0442\u0430",
          pt: "Nome da WLAN no modo de cliente",
          nl: "WLAN-naam in clientmodus",
          fr: "Nom du WLAN en mode client",
          it: "Nome della WLAN in modalit\xE0 client",
          es: "Nombre de la WLAN en modo cliente",
          pl: "Nazwa sieci WLAN w trybie klienta",
          uk: "\u0406\u043C'\u044F \u0431\u0435\u0437\u0434\u0440\u043E\u0442\u043E\u0432\u043E\u0457 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0457 \u043C\u0435\u0440\u0435\u0436\u0456 \u0432 \u0440\u0435\u0436\u0438\u043C\u0456 \u043A\u043B\u0456\u0454\u043D\u0442\u0430",
          "zh-cn": "WLAN name in client mode"
        },
        this.ParseText
      )
    );
    this.parameterDictionary.set(
      153 /* WifiEncryptionMode */,
      new FanData(
        1,
        "network.wifiEncryptionMode",
        false,
        "state",
        "string",
        {
          en: "WLAN encryption technology",
          de: "WLAN-Verschl\xFCsselungstechnologie",
          ru: "\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u044F \u0448\u0438\u0444\u0440\u043E\u0432\u0430\u043D\u0438\u044F WLAN",
          pt: "Tecnologia de encripta\xE7\xE3o WLAN",
          nl: "WLAN-coderingstechnologie",
          fr: "Technologie de cryptage WLAN",
          it: "Tecnologia di crittografia WLAN",
          es: "Tecnolog\xEDa de cifrado WLAN",
          pl: "Technologia szyfrowania WLAN",
          uk: "\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0456\u044F \u0448\u0438\u0444\u0440\u0443\u0432\u0430\u043D\u043D\u044F WLAN",
          "zh-cn": "WLAN encryption technology"
        },
        this.ParseWifiEncryptionMode
      )
    );
    this.parameterDictionary.set(
      154 /* WifiChannel */,
      new FanData(
        1,
        "network.wifiChannel",
        false,
        "state",
        "number",
        {
          en: "WLAN channel frequency",
          de: "WLAN-Kanalfrequenz",
          ru: "\u0427\u0430\u0441\u0442\u043E\u0442\u0430 \u043A\u0430\u043D\u0430\u043B\u0430 WLAN",
          pt: "Frequ\xEAncia do canal WLAN",
          nl: "WLAN-kanaalfrequentie",
          fr: "Fr\xE9quence du canal WLAN",
          it: "Frequenza del canale WLAN",
          es: "Frecuencia del canal WLAN",
          pl: "Cz\u0119stotliwo\u015B\u0107 kana\u0142u WLAN",
          uk: "\u0427\u0430\u0441\u0442\u043E\u0442\u0430 \u043A\u0430\u043D\u0430\u043B\u0443 WLAN",
          "zh-cn": "WLAN channel frequency"
        },
        this.ParseByteNumber
      )
    );
    this.parameterDictionary.set(
      155 /* WifiIpMode */,
      new FanData(
        1,
        "network.wifiIpMode",
        false,
        "state",
        "string",
        {
          en: "WLAN module DHCP",
          de: "WLAN-Modul DHCP",
          ru: "\u041C\u043E\u0434\u0443\u043B\u044C WLAN DHCP",
          pt: "M\xF3dulo WLAN DHCP",
          nl: "WLAN-module DHCP",
          fr: "Module WLAN DHCP",
          it: "Modulo WLAN DHCP",
          es: "M\xF3dulo WLAN DHCP",
          pl: "Modu\u0142 WLAN DHCP",
          uk: "\u041C\u043E\u0434\u0443\u043B\u044C \u0431\u0435\u0437\u0434\u0440\u043E\u0442\u043E\u0432\u043E\u0457 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0457 \u043C\u0435\u0440\u0435\u0436\u0456 DHCP",
          "zh-cn": "WLAN module DHCP"
        },
        this.ParseWifiIpMode
      )
    );
    this.parameterDictionary.set(
      156 /* WifiIp */,
      new FanData(
        4,
        "network.wifiIpMode",
        false,
        "info.ip",
        "string",
        {
          en: "Assigned IP address of the WLAN module",
          de: "Zugewiesene IP-Adresse des WLAN-Moduls",
          ru: "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044B\u0439 IP-\u0430\u0434\u0440\u0435\u0441 \u043C\u043E\u0434\u0443\u043B\u044F WLAN",
          pt: "Endere\xE7o IP atribu\xEDdo ao m\xF3dulo WLAN",
          nl: "Toegewezen IP-adres van de WLAN-module",
          fr: "Adresse IP attribu\xE9e au module WLAN",
          it: "Indirizzo IP assegnato del modulo WLAN",
          es: "Direcci\xF3n IP asignada del m\xF3dulo WLAN",
          pl: "Przypisany adres IP modu\u0142u WLAN",
          uk: "\u041F\u0440\u0438\u0441\u0432\u043E\u0454\u043D\u0430 IP-\u0430\u0434\u0440\u0435\u0441\u0430 \u043C\u043E\u0434\u0443\u043B\u044F WLAN",
          "zh-cn": "Assigned IP address of the WLAN module"
        },
        this.ParseIpV4Value
      )
    );
    this.parameterDictionary.set(
      157 /* WifiSubnetMask */,
      new FanData(
        4,
        "network.wifiSubnetMask",
        false,
        "info.ip",
        "string",
        {
          en: "Subnet mask of the WLAN module",
          de: "Subnetzmaske des WLAN-Moduls",
          ru: "\u041C\u0430\u0441\u043A\u0430 \u043F\u043E\u0434\u0441\u0435\u0442\u0438 \u043C\u043E\u0434\u0443\u043B\u044F WLAN",
          pt: "M\xE1scara de sub-rede do m\xF3dulo WLAN",
          nl: "Subnetmasker van de WLAN-module",
          fr: "Masque de sous-r\xE9seau du module WLAN",
          it: "Maschera di sottorete del modulo WLAN",
          es: "M\xE1scara de subred del m\xF3dulo WLAN",
          pl: "Maska podsieci modu\u0142u WLAN",
          uk: "\u041C\u0430\u0441\u043A\u0430 \u043F\u0456\u0434\u043C\u0435\u0440\u0435\u0436\u0456 \u043C\u043E\u0434\u0443\u043B\u044F WLAN",
          "zh-cn": "Subnet mask of the WLAN module"
        },
        this.ParseIpV4Value
      )
    );
    this.parameterDictionary.set(
      158 /* WifiGateway */,
      new FanData(
        4,
        "network.wifiGateway",
        false,
        "info.ip",
        "string",
        {
          en: "Main gateway of the WLAN module",
          de: "Haupt-Gateway des WLAN-Moduls",
          ru: "\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0448\u043B\u044E\u0437 \u043C\u043E\u0434\u0443\u043B\u044F WLAN",
          pt: "Gateway principal do m\xF3dulo WLAN",
          nl: "Hoofdgateway van de WLAN-module",
          fr: "Passerelle principale du module WLAN",
          it: "Gateway principale del modulo WLAN",
          es: "Pasarela principal del m\xF3dulo WLAN",
          pl: "Brama g\u0142\xF3wna modu\u0142u WLAN",
          uk: "\u0413\u043E\u043B\u043E\u0432\u043D\u0438\u0439 \u0448\u043B\u044E\u0437 \u043C\u043E\u0434\u0443\u043B\u044F WLAN",
          "zh-cn": "Main gateway of the WLAN module"
        },
        this.ParseIpV4Value
      )
    );
    this.parameterDictionary.set(
      163 /* CurrentWifiIp */,
      new FanData(
        4,
        "network.currentWifiIp",
        false,
        "info.ip",
        "string",
        {
          en: "Current IP address of the WLAN module",
          de: "Aktuelle IP-Adresse des WLAN-Moduls",
          ru: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 IP-\u0430\u0434\u0440\u0435\u0441 \u043C\u043E\u0434\u0443\u043B\u044F WLAN",
          pt: "Endere\xE7o IP atual do m\xF3dulo WLAN",
          nl: "Huidig IP-adres van de WLAN-module",
          fr: "Adresse IP actuelle du module WLAN",
          it: "Indirizzo IP attuale del modulo WLAN",
          es: "Direcci\xF3n IP actual del m\xF3dulo WLAN",
          pl: "Aktualny adres IP modu\u0142u WLAN",
          uk: "\u041F\u043E\u0442\u043E\u0447\u043D\u0430 IP-\u0430\u0434\u0440\u0435\u0441\u0430 \u043C\u043E\u0434\u0443\u043B\u044F \u0431\u0435\u0437\u0434\u0440\u043E\u0442\u043E\u0432\u043E\u0457 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0457 \u043C\u0435\u0440\u0435\u0436\u0456",
          "zh-cn": "Current IP address of the WLAN module"
        },
        this.ParseIpV4Value
      )
    );
    this.parameterDictionary.set(
      183 /* FanOperatingMode */,
      new FanData(
        1,
        "fan.fanOperatingMode",
        true,
        "state",
        "mixed",
        {
          en: "Operating mode of the fan",
          de: "Betriebsart des Ventilators",
          ru: "\u0420\u0435\u0436\u0438\u043C \u0440\u0430\u0431\u043E\u0442\u044B \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430",
          pt: "Modo de funcionamento do ventilador",
          nl: "Werkingsmodus van de ventilator",
          fr: "Mode de fonctionnement du ventilateur",
          it: "Modalit\xE0 di funzionamento del ventilatore",
          es: "Modo de funcionamiento del ventilador",
          pl: "Tryb pracy wentylatora",
          uk: "\u0420\u0435\u0436\u0438\u043C \u0440\u043E\u0431\u043E\u0442\u0438 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u0430",
          "zh-cn": "Operating mode of the fan"
        },
        this.ParseOperatingMode,
        "",
        0,
        2
      )
    );
    this.parameterDictionary.set(
      184 /* TargetAnalogVoltageValue */,
      new FanData(
        1,
        "sensors.targetAnalogVoltageValue",
        true,
        "state",
        "number",
        {
          en: "Setpoint of the sensor 0-10 V",
          de: "Sollwert des Sensors 0-10 V",
          ru: "\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0434\u0430\u0442\u0447\u0438\u043A\u0430 0-10 \u0412",
          pt: "Ponto de regula\xE7\xE3o do sensor 0-10 V",
          nl: "Instelpunt van de sensor 0-10 V",
          fr: "Point de consigne du capteur 0-10 V",
          it: "Setpoint del sensore 0-10 V",
          es: "Consigna del sensor 0-10 V",
          pl: "Warto\u015B\u0107 zadana czujnika 0-10 V",
          uk: "\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0434\u0430\u0442\u0447\u0438\u043A\u0430 0-10 \u0412",
          "zh-cn": "Setpoint of the sensor 0-10 V"
        },
        this.ParseByteNumber,
        "%",
        5,
        100
      )
    );
    this.parameterDictionary.set(
      185 /* FanType */,
      new FanData(
        2,
        "system.fanType",
        false,
        "state",
        "string",
        {
          en: "System type",
          de: "Anlagentyp",
          ru: "\u0422\u0438\u043F \u0441\u0438\u0441\u0442\u0435\u043C\u044B",
          pt: "Tipo de sistema",
          nl: "Type systeem",
          fr: "Type de syst\xE8me",
          it: "Tipo di sistema",
          es: "Tipo de sistema",
          pl: "Typ systemu",
          uk: "\u0422\u0438\u043F \u0441\u0438\u0441\u0442\u0435\u043C\u0438",
          "zh-cn": "System type"
        },
        this.ParseSystemType
      )
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FanData,
  OxxifyProtocol,
  ParameterType
});
//# sourceMappingURL=OxxifyProtocol.js.map