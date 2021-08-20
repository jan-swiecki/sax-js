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
  randomXmlStream: () => randomXmlStream
});
var import_stream = __toModule(require("stream"));
const _ = require("lodash");
const { random, round, ceil } = Math;
const alnum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const alphabetic = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function randomString(len = 10, chars = alnum, garbageProbability = 0, dontRepeatValues = null, retries = 3) {
  if (retries === 0) {
    throw new Error(`randomString: maximum retires reached, dontRepeatValue are getting repeated: ${[...dontRepeatValues.values()].join(", ")} (len=${len}, chars=${chars}, garbageProbability=${garbageProbability})`);
  }
  let result = "";
  let charactersLength = chars.length;
  for (let i = 0; i < len; i++) {
    const c = Math.random() < garbageProbability ? String.fromCharCode(Math.floor(256 * Math.random())) : chars.charAt(Math.floor(Math.random() * charactersLength));
    result += c;
  }
  if (dontRepeatValues && dontRepeatValues.has(result)) {
    return randomString(len, chars, garbageProbability, dontRepeatValues, retries - 1);
  } else {
    return result;
  }
}
__name(randomString, "randomString");
function gen(f) {
  return (/* @__PURE__ */ __name(function* g() {
    let n = 0;
    while (true) {
      const d = f(n++);
      if (!d) {
        break;
      }
      yield d;
    }
  }, "g"))();
}
__name(gen, "gen");
function* openTag(t, d = null, indent = "", format = true) {
  yield `${indent}<${t}`;
  let a;
  let attrs = randomAttributesString(d.maxAttributes || 0, d.maxAttributeKeySize || 0, d.maxAttributeValueSize || 0);
  while (a = attrs.next()) {
    if (a.done) {
      break;
    }
    yield " ";
    yield a.value;
  }
  yield ">";
  if (format) {
    yield "\n";
  }
  const text = randomString(ceil(d.maxTextSize * random()));
  if (format) {
    for (let x = 0; x < text.length; x += 120) {
      yield `${indent}  ${text.substring(x, x + 120)}
`;
    }
  } else {
    yield text;
  }
  const cdata = randomString(ceil(d.maxCDataSize * random()));
  if (format) {
    if (cdata.length > 0) {
      yield `${indent}  <![CDATA[`;
      for (let x = 0; x < cdata.length; x += 120) {
        if (x > 0) {
          yield `${indent}  `;
        }
        yield `${cdata.substring(x, x + 120)}`;
        if (x + 120 < cdata.length) {
          yield "\n";
        }
      }
      yield `]]>
`;
    }
  } else {
    yield `<![CDATA[${cdata}]]>`;
  }
}
__name(openTag, "openTag");
function* closeTag(t) {
  yield `</${t}>`;
}
__name(closeTag, "closeTag");
function* randomAttributesString(maxAttributes, maxAttributeKeySize, maxAttributeValueSize) {
  let dontRepeatValues = new Set();
  let max = ceil(maxAttributes * random());
  while (max--) {
    const key = randomString(ceil(maxAttributeKeySize * random()), alphabetic, 0, dontRepeatValues);
    dontRepeatValues.add(key);
    const value = randomString(ceil(maxAttributeValueSize * random()));
    yield `${key}="${value}"`;
  }
}
__name(randomAttributesString, "randomAttributesString");
function randomXmlStream(options) {
  const depthGenerator = gen(options.depthGenerator);
  const depthResults = [];
  const trailingEndLine = _.isUndefined(options.trailingEndLine) ? true : options.trailingEndLine;
  const garbageProbability = _.isUndefined(options.garbageProbability) ? 0 : options.garbageProbability;
  const format = _.isUndefined(options.format) ? true : options.format;
  const highwaterMark = options.highWatermark || 16 * 1024;
  let stop = false;
  const ret = import_stream.Readable.from(async function* () {
    let h = highwaterMark;
    let buffer = "";
    for (const chunk of randomXml()) {
      buffer += chunk;
      if (buffer.length > highwaterMark) {
        yield buffer;
        buffer = "";
        await new Promise((r) => setImmediate(r));
      }
    }
    yield buffer;
  }());
  ret.finish = () => {
    stop = true;
  };
  return ret;
  function* randomXml(depth = 0) {
    const indent = format ? "  ".repeat(depth) : "";
    const depthRes = depthResults[depth] || depthGenerator.next();
    depthResults[depth] = depthRes;
    if (depthRes.done) {
      return;
    }
    const d = depthRes.value;
    let maxChildren = depth === 0 ? 1 : ceil(d.maxChildren * random());
    if (maxChildren >= 1) {
      while (maxChildren-- && !stop) {
        const tag = randomString(10, alphabetic, garbageProbability);
        yield* openTag(tag, d, indent, format);
        yield* randomXml(depth + 1);
        yield indent;
        yield* closeTag(tag);
        if (trailingEndLine && format) {
          yield "\n";
        }
      }
    }
  }
  __name(randomXml, "randomXml");
}
__name(randomXmlStream, "randomXmlStream");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  randomXmlStream
});
