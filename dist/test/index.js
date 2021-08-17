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
  test: () => test
});
var import_sax = __toModule(require("../lib/sax.js"));
var import_tap = __toModule(require("tap"));
function test(options) {
  let xml = options.xml;
  let parser = new import_sax.SAXParser(options.strict, options.opt);
  let expect = options.expect;
  let e = 0;
  import_sax.EventTypes.forEach(function(ev) {
    parser.on(ev, function(n) {
      if (process.env.DEBUG) {
        console.error({
          expect: expect[e],
          actual: [ev, n]
        });
      }
      if (e >= expect.length && (ev === "onend" || ev === "onready")) {
        return;
      }
      import_tap.default.ok(e < expect.length, "no unexpected events");
      if (!expect[e]) {
        import_tap.default.fail("did not expect this event", {
          event: ev,
          expect,
          data: n
        });
        return;
      }
      import_tap.default.equal(ev.replace(/^on/, ""), expect[e][0]);
      if (ev === "onerror") {
        import_tap.default.equal(n.message, expect[e][1]);
      } else {
        import_tap.default.same(n, expect[e][1]);
      }
      e++;
      if (ev === "onerror") {
        parser.resume();
      }
    });
  });
  if (xml) {
    parser.write(xml).close();
  }
  return parser;
}
__name(test, "test");
if (module === require.main) {
  import_tap.default.pass("common test file");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  test
});
