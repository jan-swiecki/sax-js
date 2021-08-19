var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
__export(exports, {
  ONE_MILISECOND: () => ONE_MILISECOND,
  ONE_SECOND: () => ONE_SECOND,
  ONE_SECOND_N: () => ONE_SECOND_N,
  nowTime: () => nowTime,
  timeToMilliseconds: () => timeToMilliseconds,
  timeToSeconds: () => timeToSeconds
});
let ONE_MILISECOND = BigInt(10 ** 6);
let ONE_SECOND = 10 ** 9;
let ONE_SECOND_N = BigInt(ONE_SECOND);
let nowTime = /* @__PURE__ */ __name(() => process.hrtime.bigint(), "nowTime");
let timeToSeconds = /* @__PURE__ */ __name((t) => Number(t * 1000n / ONE_MILISECOND) / 1e3, "timeToSeconds");
let timeToMilliseconds = /* @__PURE__ */ __name((t) => t / ONE_MILISECOND, "timeToMilliseconds");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ONE_MILISECOND,
  ONE_SECOND,
  ONE_SECOND_N,
  nowTime,
  timeToMilliseconds,
  timeToSeconds
});
