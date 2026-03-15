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
var Utility_exports = {};
__export(Utility_exports, {
  Utility: () => Utility
});
module.exports = __toCommonJS(Utility_exports);
class Utility {
  static FORBIDDEN_CHARS = /[^a-zA-Z0-9._-]/g;
  /**
   * Parses a fan ID from a state identifier string.
   *
   * @param strId The state identifier string.
   * @returns The 16-character hex fan ID if found, otherwise undefined.
   */
  static ParseFanId(strId) {
    const strFanIdRegex = "[0-9A-Fa-f]{16}";
    const match = strId.match(strFanIdRegex);
    if (match) {
      return match.toString();
    }
    return void 0;
  }
  /**
   * Removes invalid characters from a user input string by replacing them with underscores.
   *
   * @param strUserInput The user input string.
   * @returns The sanitized string.
   */
  static RemoveInvalidCharacters(strUserInput) {
    if (strUserInput == null) {
      return "_";
    }
    return strUserInput.replace(Utility.FORBIDDEN_CHARS, "_");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Utility
});
//# sourceMappingURL=Utility.js.map
