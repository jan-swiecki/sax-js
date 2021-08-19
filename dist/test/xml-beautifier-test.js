var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
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
var import_xml_beautifier = __toModule(require("../lib/xml-beautifier"));
const tap = require("tap");
tap.equal((0, import_xml_beautifier.default)(`<root>1</root>`, 2), `<root>
  1
</root>`);
tap.equal((0, import_xml_beautifier.default)(`<root x="1"><child y="2">xyz</child><child y="3"><![CDATA[abc]]></child></root>`), `<root x="1">
  <child y="2">
    xyz
  </child>
  <child y="3">
    <![CDATA[abc]]>
  </child>
</root>`);
const randomXml = `<root>
  <anywhere>
    count
  </anywhere>
  <higher>
    1973812559
  </higher>
  <sunlight>
    <them>
      upper
    </them>
    <caught>
      <lose>
        alphabet
      </lose>
      <amount>
        numeral
      </amount>
      <refer>
        dream
      </refer>
      <lay>
        hunt
      </lay>
      <engine>
        stream
      </engine>
      <garage>
        everyone
      </garage>
    </caught>
    <smaller>
      spring
    </smaller>
    <waste>
      1209224147.3588629
    </waste>
    <develop>
      -213927044.4899645
    </develop>
    <require>
      -2130891977
    </require>
  </sunlight>
  <split>
    -269910315
  </split>
  <struggle>
    expect
  </struggle>
  <income>
    598441369
  </income>
</root>`;
tap.equal((0, import_xml_beautifier.default)(randomXml), randomXml);
