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
var import_SpeedFormatters = __toModule(require("../lib/SpeedFormatters"));
var import_randomXmlStream = __toModule(require("../lib/randomXmlStream"));
var import_SAXStream = __toModule(require("../lib/SAXStream"));
var import_SAXParser = __toModule(require("../lib/SAXParser"));
const fs = require("fs");
const _ = require("lodash");
const tap = require("tap");
const through2 = require("through2");
const kb = 1024;
const mb = 1024 * 1024;
const gb = 1024 * 1024 * 1024;
const test_cases = [
  [2, 16 * kb, 512],
  [2, 35 * kb, 512],
  [2, 64 * kb, 512],
  [2, 128 * kb, 512],
  [2, 128 * kb, 16 * kb]
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
    const saxStream = new import_SAXStream.SAXStream(true);
    saxStream.emitAllNodeTypes();
    let inputXml = "";
    let outputXml = "";
    let size = 0;
    const devnull = fs.createWriteStream("/dev/null");
    let c1 = { total: 0 };
    let c2 = { total: 0 };
    const infiniteXml = (0, import_randomXmlStream.randomXmlStream)({
      depthGenerator: function(n) {
        const x = n + 1;
        const y = n === 1 ? 1 : N - Math.log(x);
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
      trailingEndLine: false,
      highWatermark: highWaterMark
    });
    const stopAndCheck = /* @__PURE__ */ __name(() => {
      console.log("stop and check");
      infiniteXml.stop();
      const t1 = c1.total;
      const t2 = c2.total;
      const diffPercent = Math.abs(t2 - t1) / t2;
      tap.ok(diffPercent < 0.05, `diffPercent < 0.05, t1=${t1} t2=${t2} diffPercent=${diffPercent.toFixed(3)}, N=${N}, xml stream size=${(0, import_SpeedFormatters.formatBytes)(maxSize)}`);
      resolve();
    }, "stopAndCheck");
    let stopped = false;
    infiniteXml.pipe(through2(function(chunk, encoding, callback) {
      if (stopped) {
        callback();
        return;
      }
      if (c1.total > maxSize) {
        stopped = true;
        stopAndCheck();
      } else {
        c1.total += chunk.length;
        this.push(chunk);
      }
      callback();
    })).pipe(saxStream).on("error", (err) => {
    }).pipe(through2.obj(function(node, encoding, callback) {
      switch (node.nodeType) {
        case import_SAXParser.ENodeTypes.opentag:
          this.push(`<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join("")}${node.data.isSelfClosing ? "/" : ""}>`);
          break;
        case import_SAXParser.ENodeTypes.closetag:
          this.push(`</${node.data}>`);
          break;
        case import_SAXParser.ENodeTypes.text:
          this.push(node.data);
          break;
        case import_SAXParser.ENodeTypes.cdata:
          this.push(`<![CDATA[${node.data}]]>`);
          break;
      }
      callback();
    })).pipe(through2(function(chunk, encoding, callback) {
      if (stopped) {
        callback();
        return;
      }
      c2.total += chunk.length;
      if (c2.total > maxSize) {
        stopped = true;
        stopAndCheck();
      } else {
        this.push(chunk);
      }
      callback();
    })).pipe(devnull);
  });
}
__name(check, "check");
