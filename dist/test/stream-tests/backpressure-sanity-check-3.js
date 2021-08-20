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
let c1 = 0;
let c2 = 0;
class SlowTransform extends import_stream.Transform {
  constructor() {
    super();
    this.i = 0;
  }
  _transform(chunk, encoding, callback) {
    setTimeout(() => {
      callback();
      this.push("1".repeat(chunk.length));
    }, this.i++ * 10);
  }
}
__name(SlowTransform, "SlowTransform");
tap.plan(1);
devzero.pipe(through2(function(chunk, encoding, callback) {
  c1 += chunk.length;
  this.push(chunk);
  callback();
})).pipe(new SlowTransform()).pipe(through2(function(chunk, encoding, callback) {
  c2 += chunk.length;
  callback();
})).pipe(devnull);
setTimeout(() => {
  devzero.unpipe();
  const t1 = c1;
  const t2 = c2;
  const diffPercent = Math.abs(t2 - t1) / t2;
  tap.ok(diffPercent < 0.2, `diffPercent < 0.2, diffPercent=${diffPercent}`);
}, 1e3);
