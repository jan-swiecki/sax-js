var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
__export(exports, {
  default: () => xml_beautifier_default
});
const _ = require("lodash");
const splitOnTags = /* @__PURE__ */ __name((str) => str.split(/(<\/?[^>]+>)/g).filter((line) => line.trim() !== ""), "splitOnTags");
const isTag = /* @__PURE__ */ __name((str) => /<[^>!]+>/.test(str), "isTag");
const isXMLDeclaration = /* @__PURE__ */ __name((str) => /<\?[^?>]+\?>/.test(str), "isXMLDeclaration");
const isClosingTag = /* @__PURE__ */ __name((str) => /<\/+[^>]+>/.test(str), "isClosingTag");
const isSelfClosingTag = /* @__PURE__ */ __name((str) => /<[^>]+\/>/.test(str), "isSelfClosingTag");
const isOpeningTag = /* @__PURE__ */ __name((str) => isTag(str) && !isClosingTag(str) && !isSelfClosingTag(str) && !isXMLDeclaration(str), "isOpeningTag");
var xml_beautifier_default = /* @__PURE__ */ __name((xml, spaces = 2) => {
  let depth = 0;
  const indent = spaces ? _.repeat(" ", spaces) : "  ";
  return splitOnTags(xml).map((item) => {
    item = item.replace(/^\s+|\s+$/g, "");
    if (isClosingTag(item)) {
      depth--;
    }
    const line = _.repeat(indent, depth) + item;
    if (isOpeningTag(item)) {
      depth++;
    }
    return line;
  }).join("\n");
}, "default");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
