var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  getSpeedCounter: () => getSpeedCounter,
  getSpeedMeter: () => getSpeedMeter
});
var import_SpeedCounter = __toModule(require("./SpeedCounter"));
var import_SpeedMeter = __toModule(require("./SpeedMeter"));
const _ = require("lodash");
function getSpeedCounter(name, options) {
  options = options || {
    type: "bytes",
    ticksBufferSize: 1e4
  };
  return new import_SpeedCounter.SpeedCounter(name, options);
}
__name(getSpeedCounter, "getSpeedCounter");
function getSpeedMeter() {
  return new import_SpeedMeter.SpeedMeter();
}
__name(getSpeedMeter, "getSpeedMeter");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getSpeedCounter,
  getSpeedMeter
});
