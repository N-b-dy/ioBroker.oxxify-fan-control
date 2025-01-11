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
var DataHelpers_exports = {};
__export(DataHelpers_exports, {
  DataHelpers: () => DataHelpers
});
module.exports = __toCommonJS(DataHelpers_exports);
class DataHelpers {
  /**
   * Parses the provided ioBroker StateValue to a number. This works either for provided numbers or strings.
   * A string is at first parsed as it is. If this does not work, the first space is used to split the string
   * and the first part is expected to be a number. In case no space is found, the first characters are parsed
   * to a number (any one until the first non-numeric char appers).
   * @param value The ioBroker StateValue which is converted to a number.
   * @returns The parsed number or NaN in case it could not be parsed.
   */
  static ParseInputNumber(value, log) {
    if (typeof value !== "number" && typeof value !== "string") {
      log == null ? void 0 : log.warn(`The value is not from type number or string, but ${typeof value}`);
      return NaN;
    }
    let nValue = Number(value);
    if (typeof value === "string") {
      nValue = parseInt(value);
      if (isNaN(nValue))
        nValue = parseInt(String(value).substring(0, String(value).indexOf(" ")));
      if (isNaN(nValue)) {
        log == null ? void 0 : log.warn(`Unable to parse the number from the input value: ${value}`);
      }
    }
    return nValue;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DataHelpers
});
//# sourceMappingURL=DataHelpers.js.map
