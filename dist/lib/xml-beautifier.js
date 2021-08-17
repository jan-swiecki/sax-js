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
  default: () => xml_beautifier_default
});
var import_lodash = __toModule(require("lodash"));
const splitOnTags = /* @__PURE__ */ __name((str) => str.split(/(<\/?[^>]+>)/g).filter((line) => line.trim() !== ""), "splitOnTags");
const isTag = /* @__PURE__ */ __name((str) => /<[^>!]+>/.test(str), "isTag");
const isXMLDeclaration = /* @__PURE__ */ __name((str) => /<\?[^?>]+\?>/.test(str), "isXMLDeclaration");
const isClosingTag = /* @__PURE__ */ __name((str) => /<\/+[^>]+>/.test(str), "isClosingTag");
const isSelfClosingTag = /* @__PURE__ */ __name((str) => /<[^>]+\/>/.test(str), "isSelfClosingTag");
const isOpeningTag = /* @__PURE__ */ __name((str) => isTag(str) && !isClosingTag(str) && !isSelfClosingTag(str) && !isXMLDeclaration(str), "isOpeningTag");
var xml_beautifier_default = /* @__PURE__ */ __name((xml, spaces) => {
  let depth = 0;
  const indent = spaces ? import_lodash.default.repeat(" ", spaces) : "  ";
  return splitOnTags(xml).map((item) => {
    item = item.replace(/^\s+|\s+$/g, "");
    if (isClosingTag(item)) {
      depth--;
    }
    const line = import_lodash.default.repeat(indent, depth) + item;
    if (isOpeningTag(item)) {
      depth++;
    }
    return line;
  }).join("\n");
}, "default");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
