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
var ModelData_exports = {};
__export(ModelData_exports, {
  DataToSend: () => DataToSend,
  FanData: () => FanData,
  ParsedData: () => ParsedData,
  ParsingStatus: () => ParsingStatus,
  ReceivedData: () => ReceivedData,
  WriteDataModel: () => WriteDataModel
});
module.exports = __toCommonJS(ModelData_exports);
class DataToSend {
  /**
   * Constructor of the class.
   *
   * @param data The byte buffer holding the data to send.
   * @param ipAddress The IP address, to which the data is sent.
   */
  constructor(data, ipAddress) {
    this.data = data;
    this.ipAddress = ipAddress;
  }
  data;
  ipAddress;
}
var ParsingStatus = /* @__PURE__ */ ((ParsingStatus2) => {
  ParsingStatus2[ParsingStatus2["Ok"] = 1] = "Ok";
  ParsingStatus2[ParsingStatus2["WrongHeader"] = 2] = "WrongHeader";
  ParsingStatus2[ParsingStatus2["WrongVersion"] = 3] = "WrongVersion";
  ParsingStatus2[ParsingStatus2["WrongIdSize"] = 4] = "WrongIdSize";
  ParsingStatus2[ParsingStatus2["ChecksumError"] = 5] = "ChecksumError";
  ParsingStatus2[ParsingStatus2["Undefined"] = 6] = "Undefined";
  return ParsingStatus2;
})(ParsingStatus || {});
class ParsedData {
  constructor() {
    this.strFanId = "";
    this.status = 6 /* Undefined */;
    this.receivedData = [];
  }
  strFanId;
  status;
  receivedData;
}
class ReceivedData {
  constructor(identifer = "", value = null) {
    this.strIdentifer = identifer;
    this.value = value;
  }
  strIdentifer;
  value;
}
class WriteDataModel {
  constructor(strFanId, fanData, value) {
    this.strFanId = strFanId;
    this.fanData = fanData;
    this.value = value;
  }
  strFanId;
  fanData;
  value;
}
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DataToSend,
  FanData,
  ParsedData,
  ParsingStatus,
  ReceivedData,
  WriteDataModel
});
//# sourceMappingURL=ModelData.js.map
