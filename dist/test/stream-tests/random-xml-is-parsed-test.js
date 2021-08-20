var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var import_randomXmlStream = __toModule(require("../../lib/randomXmlStream"));
var import_SAXStream = __toModule(require("../../lib/SAXStream"));
const _ = require("lodash");
const tap = require("tap");
tap.resolves(check(0), "resolves 1");
tap.resolves(check(0), "resolves 2");
tap.resolves(check(0), "resolves 3");
tap.resolves(check(0), "resolves 4");
tap.resolves(check(0), "resolves 5");
tap.resolves(check(0), "resolves 6");
tap.resolves(check(0), "resolves 7");
tap.rejects(check(1), "rejects 8");
tap.rejects(check(0.8), "rejects 9");
tap.rejects(check(0.6), "rejects 10");
tap.rejects(check(0.4), "rejects 11");
tap.rejects(check(0.2), "rejects 12");
function check(garbageProbability) {
  return new Promise((resolve, reject) => {
    const saxStream = new import_SAXStream.SAXStream(true);
    saxStream.emitAllNodeTypes();
    return (0, import_randomXmlStream.randomXmlStream)({
      depthGenerator: function(n) {
        const x = n + 1;
        const y = n === 1 ? 1 : 3 - Math.log(x);
        if (y < 1) {
          return;
        }
        return {
          maxAttributes: 1,
          maxAttributeKeySize: 1,
          maxAttributeValueSize: 1,
          maxTextSize: 1,
          maxCDataSize: 1,
          maxChildren: y
        };
      },
      trailingEndLine: false,
      garbageProbability
    }).pipe(saxStream).on("error", (err) => {
      reject(err);
    }).on("finish", () => {
      resolve();
    });
  });
}
__name(check, "check");
