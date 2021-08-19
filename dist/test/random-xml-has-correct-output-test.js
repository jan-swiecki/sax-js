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
var import_randomXmlStream = __toModule(require("../lib/randomXmlStream"));
var import_SAXParser = __toModule(require("../lib/SAXParser"));
var import_SAXStream = __toModule(require("../lib/SAXStream"));
var import_xml_beautifier = __toModule(require("../lib/xml-beautifier"));
const _ = require("lodash");
const tap = require("tap");
const through2 = require("through2");
tap.plan(6 * 2);
check(3);
check(3);
check(3);
check(4);
check(4);
check(4);
function check(N) {
  const saxStream = new import_SAXStream.SAXStream(true);
  saxStream.emitAllNodeTypes();
  let inputXml = "";
  let outputXml = "";
  let size = 0;
  return (0, import_randomXmlStream.randomXmlStream)({
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
        maxChildren: y
      };
    },
    trailingEndLine: false
  }).pipe(through2(function(chunk, encoding, callback) {
    size += chunk.length;
    inputXml = inputXml + chunk;
    this.push(chunk);
    callback();
  })).pipe(saxStream).pipe(through2.obj(function(node, encoding, callback) {
    switch (node.nodeType) {
      case import_SAXParser.ENodeTypes.opentag:
        outputXml += `<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join("")}${node.data.isSelfClosing ? "/" : ""}>`;
        break;
      case import_SAXParser.ENodeTypes.closetag:
        outputXml += `</${node.data}>`;
        break;
      case import_SAXParser.ENodeTypes.text:
        outputXml += node.data;
        break;
      case import_SAXParser.ENodeTypes.cdata:
        outputXml += `<![CDATA[${node.data}]]>`;
        break;
    }
    callback();
  })).on("finish", () => {
    tap.equal(outputXml.replace(/\n/g, ""), inputXml.replace(/\n/g, ""), `newline-stripped xmls equal (input size = ${(size / 1024).toFixed(2)}kb)`);
    tap.equal((0, import_xml_beautifier.default)(outputXml), (0, import_xml_beautifier.default)(inputXml), `xml-beautified xmls equal (input size = ${(size / 1024).toFixed(2)}kb)`);
  });
}
__name(check, "check");
