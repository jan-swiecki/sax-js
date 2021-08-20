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
var import_stream = __toModule(require("stream"));
const fs = require("fs");
const tap = require("tap");
const through2 = require("through2");
const devzero = fs.createReadStream("/dev/zero");
const devnull = fs.createWriteStream("/dev/null");
class AmIAsyncOrNot extends import_stream.Transform {
  constructor() {
    super();
    this.i = 0;
  }
  _transform(chunk, encoding, callback) {
    if (this.i++ > 1e5) {
      console.log("end");
      this.end();
    } else {
      this.push("1");
      callback();
    }
  }
}
__name(AmIAsyncOrNot, "AmIAsyncOrNot");
let i = 0;
devzero.pipe(through2(function(chunk, encoding, callback) {
  if (i++ > 1e5) {
    console.log("end");
    this.end();
  } else {
    this.push("1");
    callback();
  }
})).pipe(devnull);
console.log("???");
setTimeout(() => {
  console.log("!!!");
}, 100);
