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
var import_randomXmlStream = __toModule(require("../../lib/randomXmlStream"));
var import_SAXStream = __toModule(require("../../lib/SAXStream"));
var import_SAXParser = __toModule(require("../../lib/SAXParser"));
var import_xml_beautifier = __toModule(require("../../lib/xml-beautifier"));
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
  [2, 128 * kb, 16 * kb],
  [2, mb, 32 * kb],
  [3, mb, 32 * kb],
  [4, mb, 32 * kb]
];
async function run() {
  tap.plan(test_cases.length);
  for (const args of test_cases) {
    await check(...args);
  }
}
__name(run, "run");
run();
function check(N, maxSize, highWaterMark, trailingRandomText = false) {
  return new Promise((resolve, reject) => {
    const saxStream = new import_SAXStream.SAXStream(false);
    saxStream.emitAllNodeTypes();
    let inputXml = "";
    let intermediateXml = "";
    let outputXml = "";
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
          maxChildren: x == 2 ? Infinity : null,
          trailingRandomText: trailingRandomText ? 1e3 : null
        };
      },
      trailingEndLine: false,
      highWatermark: highWaterMark
    });
    const check2 = /* @__PURE__ */ __name(() => {
      const t1 = (0, import_xml_beautifier.default)(inputXml).length;
      const t2 = (0, import_xml_beautifier.default)(outputXml).length;
      const diffPercent = Math.abs(t2 - t1) / t2;
      tap.ok(diffPercent == 0, `diffPercent == 0, t1=${t1} t2=${t2} diffPercent=${diffPercent.toFixed(3)}, N=${N}, xml stream size=${(0, import_SpeedFormatters.formatBytes)(maxSize)}, highWaterMark=${(0, import_SpeedFormatters.formatBytes)(highWaterMark)}, trailingRandomText=${trailingRandomText}`);
      resolve();
    }, "check");
    let stopped = false;
    const debug = /* @__PURE__ */ __name((name, stream) => {
      return stream;
    }, "debug");
    debug("infiniteXml", infiniteXml).pipe(debug("pipe1", through2(function(chunk, encoding, callback) {
      inputXml += chunk;
      if (c1.total > maxSize && !stopped) {
        stopped = true;
        infiniteXml.finish();
      }
      c1.total += chunk.length;
      this.push(chunk);
      callback();
    }))).pipe(debug("saxStream", saxStream)).pipe(debug("to_string", through2.obj(function(node, encoding, callback) {
      let x = "";
      switch (node.nodeType) {
        case import_SAXParser.ENodeTypes.opentag:
          this.push(x = `<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join("")}${node.data.isSelfClosing ? "/" : ""}>`);
          break;
        case import_SAXParser.ENodeTypes.closetag:
          this.push(x = `</${node.data}>`);
          break;
        case import_SAXParser.ENodeTypes.text:
          this.push(x = node.data);
          break;
        case import_SAXParser.ENodeTypes.cdata:
          this.push(x = `<![CDATA[${node.data}]]>`);
          break;
      }
      callback();
    }))).pipe(debug("pipe_last", through2(function(chunk, encoding, callback) {
      outputXml += chunk;
      c2.total += chunk.length;
      this.push(chunk);
      callback();
    }))).on("end", () => {
      check2();
    }).pipe(devnull);
  });
}
__name(check, "check");
