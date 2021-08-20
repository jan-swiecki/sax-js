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
  SAXStream: () => SAXStream
});
var import_stream = __toModule(require("stream"));
var import_string_decoder = __toModule(require("string_decoder"));
var import_SAXParser = __toModule(require("./SAXParser.js"));
class SAXStream extends import_stream.Transform {
  constructor(strict = false, opt = {}) {
    super({
      readableObjectMode: true,
      writableHighWaterMark: opt.highWaterMark || null,
      readableHighWaterMark: opt.objHighWaterMark || 16
    });
    this.buffer = [];
    this._decoder = new import_string_decoder.StringDecoder("utf8");
    this.ended = false;
    this._parser = new import_SAXParser.SAXParser(strict, opt);
    this._parser.on("end", () => {
    });
  }
  emitNodeTypes(...nodeTypes) {
  }
  emitAllNodeTypes() {
    this.emitNodeTypes(...import_SAXParser.NodeTypes);
  }
  alsoEmit(event) {
    this.emit(event.nodeType, event.data);
    return event;
  }
  _destroy(err, callback) {
    this.buffer = [];
    callback(err);
  }
  _write(chunk, encoding, callback) {
    if (Buffer.isBuffer(chunk)) {
      chunk = this._decoder.write(chunk);
    }
    this.__push(() => this._parser.write(chunk.toString()), callback);
  }
  _flush(callback) {
    this.__push(() => this._parser.write(null), callback);
  }
  __push(parserWrite, callback) {
    try {
      parserWrite();
      if (this._parser.error) {
        callback(this._parser.error);
      } else {
        for (const event of this._parser.saxDataEvents) {
          this.push(event);
        }
        callback();
      }
    } catch (err) {
      callback(err);
    }
  }
}
__name(SAXStream, "SAXStream");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SAXStream
});
