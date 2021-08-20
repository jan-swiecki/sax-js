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
var import_stream = __toModule(require("stream"));
var import_randomXmlStream = __toModule(require("../lib/randomXmlStream"));
var import_SAXStream = __toModule(require("../lib/SAXStream"));
var import_SAXParser = __toModule(require("../lib/SAXParser"));
const fs = require("fs");
const _ = require("lodash");
const tap = require("tap");
const through2 = require("through2");
const one_kb = 1024;
const one_mb = 1024 * 1024;
const ten_mb = 1024 * 1024 * 10;
const one_gb = 1024 * 1024 * 1024;
let i = 10;
let test_cases = [
  [2, 35 * one_kb],
  [2, 100 * one_kb],
  [2, one_mb]
];
tap.plan(test_cases.length + i);
const interval = setInterval(() => {
  console.log("tap ok");
  tap.ok(true, `${i} test`);
  i--;
  if (i === 0) {
    clearInterval(interval);
  }
}, 100);
for (const [N, size] of test_cases) {
  check(N, size);
}
function check(N, maxSize) {
  const saxStream = new import_SAXStream.SAXStream(true);
  saxStream.emitAllNodeTypes();
  let inputXml = "";
  let outputXml = "";
  let size = 0;
  const devnull = new import_stream.Writable({
    write(chunk, encoding, callback) {
      callback();
    }
  });
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
    trailingEndLine: false
  });
  const stopAndCheck = /* @__PURE__ */ __name(() => {
    console.log("stop and check");
    infiniteXml.unpipe();
    infiniteXml.destroy();
    tap.ok(true, `finished! N=${N}, xml stream size=${(0, import_SpeedFormatters.formatBytes)(maxSize)}`);
  }, "stopAndCheck");
  let stopped = false;
  let c1 = 0;
  let c2 = 0;
  infiniteXml.pipe(through2(function(chunk, encoding, callback) {
    c1 += chunk.length;
    this.push(chunk);
    callback();
  })).pipe(saxStream).pipe(through2.obj(function(node, encoding, callback) {
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
    c2 += chunk.length;
    if (c1 > maxSize) {
      stopped = true;
      stopAndCheck();
    } else {
      this.push(chunk);
    }
    callback();
  })).pipe(devnull);
}
__name(check, "check");
