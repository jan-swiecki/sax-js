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
const fs = require("fs");
const _ = require("lodash");
const tap = require("tap");
const through2 = require("through2");
const one_kb = 1024;
const one_mb = 1024 * 1024;
const ten_mb = 1024 * 1024 * 10;
const one_gb = 1024 * 1024 * 1024;
function isPrime(num) {
  for (var i2 = 2; i2 < num; i2++) {
    if (num % i2 === 0) {
      return false;
    }
  }
  return true;
}
__name(isPrime, "isPrime");
function getPrime(n) {
  var arr = [2];
  for (var i2 = 3; i2 < n; i2 += 2) {
    if (isPrime(i2)) {
      arr.push(i2);
    }
  }
  return arr[arr.length - 1];
}
__name(getPrime, "getPrime");
const devzero = fs.createReadStream("/dev/zero");
const devnull = fs.createWriteStream("/dev/null");
let i = 0;
const infiniteXml = (0, import_randomXmlStream.randomXmlStream)({
  depthGenerator: function(n) {
    const x = n + 1;
    const y = n === 1 ? 1 : 2 - Math.log(x);
    if (y < 1) {
      return;
    }
    return {
      maxAttributes: y,
      maxAttributeKeySize: y,
      maxAttributeValueSize: y,
      maxTextSize: y,
      maxCDataSize: y,
      maxChildren: x == 2 ? Infinity : null
    };
  },
  trailingEndLine: false
});
const saxStream = new import_SAXStream.SAXStream();
infiniteXml.pipe(saxStream).pipe(devnull);
