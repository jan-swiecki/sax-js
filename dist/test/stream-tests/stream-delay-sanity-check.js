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
var import_SpeedFormatters = __toModule(require("../../lib/SpeedFormatters"));
var import_stream = __toModule(require("stream"));
const fs = require("fs");
const _ = require("lodash");
const tap = require("tap");
const through2 = require("through2");
const kb = 1024;
const mb = 1024 * 1024;
const gb = 1024 * 1024 * 1024;
const test_cases = [
  [2, 16 * kb, 512]
];
async function run() {
  tap.plan(test_cases.length);
  for (const args of test_cases) {
    await check(...args);
  }
}
__name(run, "run");
run();
function check(N, maxSize, highWaterMark) {
  return new Promise((resolve, reject) => {
    let inputXml = "";
    let intermediateXml = "";
    let outputXml = "";
    let size = 0;
    const devzero = fs.createReadStream("/dev/zero", { highWaterMark });
    const devnull = fs.createWriteStream("/dev/null");
    let c1 = { total: 0 };
    let c2 = { total: 0 };
    const check2 = /* @__PURE__ */ __name(() => {
      console.log("stop and check");
      const t1 = c1.total;
      const t2 = c2.total;
      const diffPercent = Math.abs(t2 - t1) / t2;
      tap.ok(diffPercent < 0.05, `diffPercent < 0.05, t1=${t1} t2=${t2} diffPercent=${diffPercent.toFixed(3)}, N=${N}, xml stream size=${(0, import_SpeedFormatters.formatBytes)(maxSize)}, highWaterMark=${(0, import_SpeedFormatters.formatBytes)(highWaterMark)}`);
      resolve();
    }, "check");
    const debug = /* @__PURE__ */ __name((name, stream) => {
      return stream;
    }, "debug");
    let t = 0;
    let wait = [];
    let stopped = false;
    debug("devzero", devzero).pipe(debug("pipe1", new import_stream.Transform({ transform(chunk, encoding, callback) {
      inputXml += chunk;
      if (stopped) {
        callback();
      }
      if (c1.total > maxSize && !stopped) {
        stopped = true;
        devzero.destroy();
        this.push(null);
        callback();
        return;
      }
      c1.total += chunk.length;
      this.push(chunk);
      callback();
    } }))).pipe(new import_stream.Transform({
      transform(chunk, encoding, callback) {
        const x = t;
        wait.push(1);
        setTimeout(() => {
          this.push(chunk);
          wait[x] = 0;
        }, 10 * t++);
        callback();
      },
      async flush(callback) {
        while (_.sum(wait) > 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
        callback();
      }
    })).pipe(debug("pipe2", through2(function(chunk, encoding, callback) {
      outputXml += chunk;
      c2.total += chunk.length;
      this.push(chunk);
      callback();
    }))).on("end", () => {
      fs.writeFileSync("inputXml.xml", inputXml, "utf8");
      fs.writeFileSync("intermediateXml.xml", intermediateXml, "utf8");
      fs.writeFileSync("outputXml.xml", outputXml, "utf8");
      check2();
    }).pipe(debug("devnull", devnull));
  });
}
__name(check, "check");
