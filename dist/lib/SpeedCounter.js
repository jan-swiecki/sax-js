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
  SpeedCounter: () => SpeedCounter,
  incrMax: () => incrMax
});
var import_nanoTime = __toModule(require("./nanoTime"));
function incrMax(x, max) {
  const next = x + 1;
  if (next === max) {
    return 0;
  } else {
    return next;
  }
}
__name(incrMax, "incrMax");
class SpeedCounter {
  constructor(name, options) {
    this.t_ticks = new BigInt64Array(1e4);
    this.sum_ticks = new BigInt64Array(1e4);
    this.idx0 = 0;
    this.idx1 = 0;
    this.rolledOver = false;
    this.name = name;
    this.max = options.ticksBufferSize;
    this.reset();
  }
  reset() {
    this.t_ticks = new BigInt64Array(this.max);
    this.sum_ticks = new BigInt64Array(this.max);
    this.t_ticks.fill(0n);
    this.sum_ticks.fill(0n);
    this.idx0 = 0;
    this.idx1 = 0;
    this.count = 0n;
    this.total = 0;
    this.avg = 0;
  }
  tick(x) {
    const t = (0, import_nanoTime.nowTime)();
    const xn = BigInt(x);
    this.count++;
    const lastIdx1 = this.idx1;
    if (!this.rolledOver) {
      this.idx1 = incrMax(this.idx1, this.max);
      if (this.idx1 === 0) {
        this.idx0 = incrMax(this.idx0, this.max);
        this.rolledOver = true;
      }
    } else {
      this.idx0 = incrMax(this.idx0, this.max);
      this.idx1 = incrMax(this.idx1, this.max);
    }
    this.t_ticks[this.idx1] = t;
    this.sum_ticks[this.idx1] = this.sum_ticks[lastIdx1] + xn;
    this.total += x;
    if (this.rolledOver) {
      const x2 = this.getSizeSpan();
      const t2 = this.getTimeSpan();
      this.avg = Number(import_nanoTime.ONE_SECOND_N * 1000000n * x2 / t2) / 1e6;
    } else {
      this.avg = 0;
    }
  }
  getTimeSpan() {
    return this.t_ticks[this.idx1] - this.t_ticks[this.idx0];
  }
  getSizeSpan() {
    return this.sum_ticks[this.idx1] - this.sum_ticks[this.idx0];
  }
}
__name(SpeedCounter, "SpeedCounter");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SpeedCounter,
  incrMax
});
