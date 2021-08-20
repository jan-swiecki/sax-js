var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
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
var import_speed = __toModule(require("../../lib/speed"));
var import_SpeedFormatters = __toModule(require("../../lib/SpeedFormatters"));
const fs = require("fs");
const tap = require("tap");
const through2 = require("through2");
const devzero = fs.createReadStream("/dev/zero");
const devnull = fs.createWriteStream("/dev/null");
const speedMeter = (0, import_speed.getSpeedMeter)().start();
const c1 = speedMeter.addCounter("/dev/null", import_SpeedFormatters.bytesEmojiFormatter);
const c2 = speedMeter.addCounter("second pipe", import_SpeedFormatters.bytesEmojiFormatter);
tap.plan(1);
devzero.pipe(through2(function(chunk, encoding, callback) {
  c1.tick(chunk.length);
  this.push(chunk);
  callback();
})).pipe(through2(function(chunk, encoding, callback) {
  c2.tick(chunk.length);
  this.push(chunk);
  callback();
})).pipe(devnull);
setTimeout(() => {
  devzero.unpipe();
  speedMeter.stop();
  const t1 = c1.total;
  const t2 = c2.total;
  const diffPercent = Math.abs(t2 - t1) / t2;
  tap.ok(diffPercent < 0.01, `diffPercent < 0.01, diffPercent=${diffPercent}`);
}, 1e3);
