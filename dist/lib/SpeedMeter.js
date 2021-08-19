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
  SpeedMeter: () => SpeedMeter
});
var import_nanoTime = __toModule(require("./nanoTime"));
var import_speed = __toModule(require("./speed"));
var import_SpeedFormatters = __toModule(require("./SpeedFormatters"));
const _ = require("lodash");
let stream = process.stderr;
class SpeedMeter {
  constructor() {
    this.counters = [];
    this.formatters = [];
    this.printThreshold = 10000000n;
    this.lastTime = (0, import_nanoTime.nowTime)();
  }
  addCounter(counterName, formatter) {
    const counter = (0, import_speed.getSpeedCounter)(counterName);
    this.counters.push(counter);
    this.formatters.push(formatter ? formatter : import_SpeedFormatters.plainFormatter);
    return counter;
  }
  start() {
    this.interval = setInterval(() => {
      this.print();
    }, 50);
    return this;
  }
  stop() {
    if (!_.isUndefined(this.interval)) {
      clearInterval(this.interval);
      stream.write("\n");
    }
    return this;
  }
  print() {
    const now = (0, import_nanoTime.nowTime)();
    if (now - this.lastTime > this.printThreshold) {
      this.lastTime = (0, import_nanoTime.nowTime)();
      let str = [];
      let fmtIdx = 0;
      for (const counter of this.counters) {
        const fmt = this.formatters[fmtIdx++];
        const { speed, total } = fmt(counter.avg, counter.total);
        str = str.concat([
          counter.name.padEnd(16),
          " :: ",
          speed,
          `[ total = `,
          total,
          ` ]`
        ].join(" "));
      }
      this.writeLine(`${str.join("\n")}`);
    }
  }
  writeLine(line, force = false) {
    if (stream.cursorTo) {
      stream.cursorTo(0, 0);
      stream.clearScreenDown();
      stream.write(line);
    } else {
      stream.write(`${new Date().toISOString()}  ${line}
`);
    }
  }
}
__name(SpeedMeter, "SpeedMeter");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SpeedMeter
});
