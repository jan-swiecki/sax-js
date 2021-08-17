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
  ENTITIES: () => ENTITIES,
  EventTypes: () => EventTypes,
  NodeTypes: () => NodeTypes,
  SAXParser: () => SAXParser
});
var import_stream = __toModule(require("stream"));
var import_lodash = __toModule(require("lodash"));
var import_SAXEntities = __toModule(require("./SAXEntities.js"));
var import_xml_beautifier = __toModule(require("./xml-beautifier.js"));
const NodeTypes = [
  "opencdata",
  "sgmldeclaration",
  "doctype",
  "comment",
  "closecdata",
  "processinginstruction",
  "opennamespace",
  "opentag",
  "extractedrawtag",
  "closetag",
  "closenamespace",
  "cdata",
  "script",
  "opentagstart",
  "attribute",
  "text"
];
const EventTypes = NodeTypes.concat(["ready", "end", "error"]);
let CDATA = "[CDATA[";
let DOCTYPE = "DOCTYPE";
let XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
let XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
let rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
let nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
let nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
let entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
let entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
function isWhitespace(c) {
  return c === " " || c === "\n" || c === "\r" || c === "	";
}
__name(isWhitespace, "isWhitespace");
function isQuote(c) {
  return c === '"' || c === "'";
}
__name(isQuote, "isQuote");
function isAttribEnd(c) {
  return c === ">" || isWhitespace(c);
}
__name(isAttribEnd, "isAttribEnd");
function isMatch(regex, c) {
  return regex.test(c);
}
__name(isMatch, "isMatch");
function notMatch(regex, c) {
  return !isMatch(regex, c);
}
__name(notMatch, "notMatch");
let _S = 0;
const sax = {};
sax.STATE = {
  BEGIN: _S++,
  BEGIN_WHITESPACE: _S++,
  TEXT: _S++,
  TEXT_ENTITY: _S++,
  OPEN_WAKA: _S++,
  SGML_DECL: _S++,
  SGML_DECL_QUOTED: _S++,
  DOCTYPE: _S++,
  DOCTYPE_QUOTED: _S++,
  DOCTYPE_DTD: _S++,
  DOCTYPE_DTD_QUOTED: _S++,
  COMMENT_STARTING: _S++,
  COMMENT: _S++,
  COMMENT_ENDING: _S++,
  COMMENT_ENDED: _S++,
  CDATA: _S++,
  CDATA_ENDING: _S++,
  CDATA_ENDING_2: _S++,
  PROC_INST: _S++,
  PROC_INST_BODY: _S++,
  PROC_INST_ENDING: _S++,
  OPEN_TAG: _S++,
  OPEN_TAG_SLASH: _S++,
  ATTRIB: _S++,
  ATTRIB_NAME: _S++,
  ATTRIB_NAME_SAW_WHITE: _S++,
  ATTRIB_VALUE: _S++,
  ATTRIB_VALUE_QUOTED: _S++,
  ATTRIB_VALUE_CLOSED: _S++,
  ATTRIB_VALUE_UNQUOTED: _S++,
  ATTRIB_VALUE_ENTITY_Q: _S++,
  ATTRIB_VALUE_ENTITY_U: _S++,
  CLOSE_TAG: _S++,
  CLOSE_TAG_SAW_WHITE: _S++,
  SCRIPT: _S++,
  SCRIPT_ENDING: _S++
};
sax.XML_ENTITIES = {
  "amp": "&",
  "gt": ">",
  "lt": "<",
  "quot": '"',
  "apos": "'"
};
sax.ENTITIES = import_lodash.default.clone(import_SAXEntities.default);
const ENTITIES = sax.ENTITIES;
function textopts(opt, text) {
  if (opt.trim)
    text = text.trim();
  if (opt.normalize)
    text = text.replace(/\s+/g, " ");
  return text;
}
__name(textopts, "textopts");
function qname(name, attribute) {
  let i = name.indexOf(":");
  let qualName = i < 0 ? ["", name] : name.split(":");
  let prefix = qualName[0];
  let local = qualName[1];
  if (attribute && name === "xmlns") {
    prefix = "xmlns";
    local = "";
  }
  return { prefix, local };
}
__name(qname, "qname");
function charAt(chunk, i) {
  let result = "";
  if (i < chunk.length) {
    result = chunk.charAt(i);
  }
  return result;
}
__name(charAt, "charAt");
function fix_indent(xml) {
  return (0, import_xml_beautifier.default)(xml, 2);
}
__name(fix_indent, "fix_indent");
Object.keys(sax.ENTITIES).forEach(function(key) {
  let e = sax.ENTITIES[key];
  let s = typeof e === "number" ? String.fromCharCode(e) : e;
  sax.ENTITIES[key] = s;
});
for (let s in sax.STATE) {
  sax.STATE[sax.STATE[s]] = s;
}
let S = sax.STATE;
const buffers = [
  "comment",
  "sgmlDecl",
  "textNode",
  "tagName",
  "doctype",
  "procInstName",
  "procInstBody",
  "entity",
  "attribName",
  "attribValue",
  "cdata",
  "script"
];
class SAXParser extends import_stream.EventEmitter {
  constructor(strict, opt) {
    super();
    this.MAX_BUFFER_LENGTH = 64 * 1024;
    this.strict = strict;
    this.opt = opt;
    this.reset();
  }
  clearBuffers() {
    for (let i = 0, l = buffers.length; i < l; i++) {
      this[buffers[i]] = "";
    }
  }
  setMaxBufferLength(value) {
    this.MAX_BUFFER_LENGTH = value;
  }
  reset() {
    this.clearBuffers();
    this.q = this.c = "";
    this.MAX_BUFFER_LENGTH = this.opt?.MAX_BUFFER_LENGTH || this.MAX_BUFFER_LENGTH;
    this.bufferCheckPosition = this.MAX_BUFFER_LENGTH;
    this.opt = this.opt || {};
    this.opt.lowercase = this.opt.lowercase || this.opt.lowercasetags;
    this.looseCase = this.opt.lowercase ? "toLowerCase" : "toUpperCase";
    this.tags = [];
    this.closed = this.closedRoot = this.sawRoot = false;
    this.tag = this.error = null;
    this.noscript = !!(this.strict || this.opt.noscript);
    this.state = S.BEGIN;
    this.strictEntities = this.opt.strictEntities;
    this.ENTITIES = this.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
    this.attribList = [];
    this.opt.extractRawTagContent = this.opt.extractRawTagContent || null;
    this.opt.extractRawTagContentEnabled = !!this.opt.extractRawTagContent;
    if (this.opt.extractRawTagContentEnabled) {
      this.rawTagTracking = false;
      this.rawTagExtract = "";
    }
    this.path = [];
    if (this.opt.xmlns) {
      this.ns = Object.create(rootNS);
    }
    this.trackPosition = this.opt.position !== false;
    if (this.trackPosition) {
      this.position = this.line = this.column = 0;
    }
    this.emit("ready");
  }
  end() {
    if (this.sawRoot && !this.closedRoot)
      this.strictFail("Unclosed root tag");
    if (this.state !== S.BEGIN && this.state !== S.BEGIN_WHITESPACE && this.state !== S.TEXT) {
      this._error("Unexpected end");
    }
    this.closeText();
    this.c = "";
    this.closed = true;
    this.emit("end");
    this.reset();
    return this;
  }
  resume() {
    this.error = null;
    return this;
  }
  close() {
    this.write(null);
  }
  flush() {
    this.flushBuffers();
  }
  flushBuffers() {
    this.closeText();
    if (this.cdata !== "") {
      this.emitNode("cdata", this.cdata);
      this.cdata = "";
    }
    if (this.script !== "") {
      this.emitNode("script", this.script);
      this.script = "";
    }
  }
  emitNode(nodeType, data) {
    if (this.textNode) {
      this.closeText();
    }
    this.emit(nodeType, data);
  }
  closeText() {
    this.textNode = textopts(this.opt, this.textNode);
    if (this.textNode) {
      this.emit("text", this.textNode);
    }
    this.textNode = "";
  }
  write(chunk) {
    if (this.error) {
      throw this.error;
    }
    if (this.closed) {
      return this._error("Cannot write after close. Assign an onready handler.");
    }
    if (chunk === null) {
      return this.end();
    }
    if (typeof chunk === "object") {
      chunk = chunk.toString();
    }
    let i = 0;
    let c = "";
    while (true) {
      c = charAt(chunk, i++);
      this.c = c;
      if (this.rawTagTracking) {
        this.rawTagExtract += c;
      }
      if (!c) {
        break;
      }
      if (this.trackPosition) {
        this.position++;
        if (c === "\n") {
          this.line++;
          this.column = 0;
        } else {
          this.column++;
        }
      }
      switch (this.state) {
        case S.BEGIN:
          this.state = S.BEGIN_WHITESPACE;
          if (c === "\uFEFF") {
            continue;
          }
          this.beginWhiteSpace(c);
          continue;
        case S.BEGIN_WHITESPACE:
          this.beginWhiteSpace(c);
          continue;
        case S.TEXT:
          if (this.sawRoot && !this.closedRoot) {
            let starti = i - 1;
            while (c && c !== "<" && c !== "&") {
              c = charAt(chunk, i++);
              if (this.rawTagTracking) {
                this.rawTagExtract += c;
              }
              if (c && this.trackPosition) {
                this.position++;
                if (c === "\n") {
                  this.line++;
                  this.column = 0;
                } else {
                  this.column++;
                }
              }
            }
            this.textNode += chunk.substring(starti, i - 1);
          }
          if (c === "<" && !(this.sawRoot && this.closedRoot && !this.strict)) {
            this.state = S.OPEN_WAKA;
            this.startTagPosition = this.position;
          } else {
            if (!isWhitespace(c) && (!this.sawRoot || this.closedRoot)) {
              this.strictFail("Text data outside of root node.");
            }
            if (c === "&") {
              this.state = S.TEXT_ENTITY;
            } else {
              this.textNode += c;
            }
          }
          continue;
        case S.SCRIPT:
          if (c === "<") {
            this.state = S.SCRIPT_ENDING;
          } else {
            this.script += c;
          }
          continue;
        case S.SCRIPT_ENDING:
          if (c === "/") {
            this.state = S.CLOSE_TAG;
          } else {
            this.script += "<" + c;
            this.state = S.SCRIPT;
          }
          continue;
        case S.OPEN_WAKA:
          if (c === "!") {
            this.state = S.SGML_DECL;
            this.sgmlDecl = "";
          } else if (isWhitespace(c)) {
          } else if (isMatch(nameStart, c)) {
            this.state = S.OPEN_TAG;
            this.tagName = c;
          } else if (c === "/") {
            this.state = S.CLOSE_TAG;
            this.tagName = "";
          } else if (c === "?") {
            this.state = S.PROC_INST;
            this.procInstName = this.procInstBody = "";
          } else {
            this.strictFail("Unencoded <");
            if (this.startTagPosition + 1 < this.position) {
              let pad = this.position - this.startTagPosition;
              c = new Array(pad).join(" ") + c;
            }
            this.textNode += "<" + c;
            this.state = S.TEXT;
          }
          continue;
        case S.SGML_DECL:
          if ((this.sgmlDecl + c).toUpperCase() === CDATA) {
            this.emitNode("opencdata");
            this.state = S.CDATA;
            this.sgmlDecl = "";
            this.cdata = "";
          } else if (this.sgmlDecl + c === "--") {
            this.state = S.COMMENT;
            this.comment = "";
            this.sgmlDecl = "";
          } else if ((this.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            this.state = S.DOCTYPE;
            if (this.doctype || this.sawRoot) {
              this.strictFail("Inappropriately located doctype declaration");
            }
            this.doctype = "";
            this.sgmlDecl = "";
          } else if (c === ">") {
            this.emitNode("sgmldeclaration", this.sgmlDecl);
            this.sgmlDecl = "";
            this.state = S.TEXT;
          } else if (isQuote(c)) {
            this.state = S.SGML_DECL_QUOTED;
            this.sgmlDecl += c;
          } else {
            this.sgmlDecl += c;
          }
          continue;
        case S.SGML_DECL_QUOTED:
          if (c === this.q) {
            this.state = S.SGML_DECL;
            this.q = "";
          }
          this.sgmlDecl += c;
          continue;
        case S.DOCTYPE:
          if (c === ">") {
            this.state = S.TEXT;
            this.emitNode("doctype", this.doctype);
            this.doctype = "<saxparser_true>";
          } else {
            this.doctype += c;
            if (c === "[") {
              this.state = S.DOCTYPE_DTD;
            } else if (isQuote(c)) {
              this.state = S.DOCTYPE_QUOTED;
              this.q = c;
            }
          }
          continue;
        case S.DOCTYPE_QUOTED:
          this.doctype += c;
          if (c === this.q) {
            this.q = "";
            this.state = S.DOCTYPE;
          }
          continue;
        case S.DOCTYPE_DTD:
          this.doctype += c;
          if (c === "]") {
            this.state = S.DOCTYPE;
          } else if (isQuote(c)) {
            this.state = S.DOCTYPE_DTD_QUOTED;
            this.q = c;
          }
          continue;
        case S.DOCTYPE_DTD_QUOTED:
          this.doctype += c;
          if (c === this.q) {
            this.state = S.DOCTYPE_DTD;
            this.q = "";
          }
          continue;
        case S.COMMENT:
          if (c === "-") {
            this.state = S.COMMENT_ENDING;
          } else {
            this.comment += c;
          }
          continue;
        case S.COMMENT_ENDING:
          if (c === "-") {
            this.state = S.COMMENT_ENDED;
            this.comment = textopts(this.opt, this.comment);
            if (this.comment) {
              this.emitNode("comment", this.comment);
            }
            this.comment = "";
          } else {
            this.comment += "-" + c;
            this.state = S.COMMENT;
          }
          continue;
        case S.COMMENT_ENDED:
          if (c !== ">") {
            this.strictFail("Malformed comment");
            this.comment += "--" + c;
            this.state = S.COMMENT;
          } else {
            this.state = S.TEXT;
          }
          continue;
        case S.CDATA:
          if (c === "]") {
            this.state = S.CDATA_ENDING;
          } else {
            this.cdata += c;
          }
          continue;
        case S.CDATA_ENDING:
          if (c === "]") {
            this.state = S.CDATA_ENDING_2;
          } else {
            this.cdata += "]" + c;
            this.state = S.CDATA;
          }
          continue;
        case S.CDATA_ENDING_2:
          if (c === ">") {
            if (this.cdata) {
              this.emitNode("cdata", this.cdata);
            }
            this.emitNode("closecdata");
            this.cdata = "";
            this.state = S.TEXT;
          } else if (c === "]") {
            this.cdata += "]";
          } else {
            this.cdata += "]]" + c;
            this.state = S.CDATA;
          }
          continue;
        case S.PROC_INST:
          if (c === "?") {
            this.state = S.PROC_INST_ENDING;
          } else if (isWhitespace(c)) {
            this.state = S.PROC_INST_BODY;
          } else {
            this.procInstName += c;
          }
          continue;
        case S.PROC_INST_BODY:
          if (!this.procInstBody && isWhitespace(c)) {
            continue;
          } else if (c === "?") {
            this.state = S.PROC_INST_ENDING;
          } else {
            this.procInstBody += c;
          }
          continue;
        case S.PROC_INST_ENDING:
          if (c === ">") {
            this.emitNode("processinginstruction", {
              name: this.procInstName,
              body: this.procInstBody
            });
            this.procInstName = this.procInstBody = "";
            this.state = S.TEXT;
          } else {
            this.procInstBody += "?" + c;
            this.state = S.PROC_INST_BODY;
          }
          continue;
        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            this.tagName += c;
          } else {
            this.newTag();
            if (c === ">") {
              this.openTag();
            } else if (c === "/") {
              this.state = S.OPEN_TAG_SLASH;
            } else {
              if (!isWhitespace(c)) {
                this.strictFail("Invalid character in tag name");
              }
              this.state = S.ATTRIB;
            }
          }
          continue;
        case S.OPEN_TAG_SLASH:
          if (c === ">") {
            this.openTag(true);
            this.closeTag();
          } else {
            this.strictFail("Forward-slash in opening tag not followed by >");
            this.state = S.ATTRIB;
          }
          continue;
        case S.ATTRIB:
          if (isWhitespace(c)) {
            continue;
          } else if (c === ">") {
            this.openTag();
          } else if (c === "/") {
            this.state = S.OPEN_TAG_SLASH;
          } else if (isMatch(nameStart, c)) {
            this.attribName = c;
            this.attribValue = "";
            this.state = S.ATTRIB_NAME;
          } else {
            this.strictFail("Invalid attribute name");
          }
          continue;
        case S.ATTRIB_NAME:
          if (c === "=") {
            this.state = S.ATTRIB_VALUE;
          } else if (c === ">") {
            this.strictFail("Attribute without value");
            this.attribValue = this.attribName;
            this.attrib();
            this.openTag();
          } else if (isWhitespace(c)) {
            this.state = S.ATTRIB_NAME_SAW_WHITE;
          } else if (isMatch(nameBody, c)) {
            this.attribName += c;
          } else {
            this.strictFail("Invalid attribute name");
          }
          continue;
        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === "=") {
            this.state = S.ATTRIB_VALUE;
          } else if (isWhitespace(c)) {
            continue;
          } else {
            this.strictFail("Attribute without value");
            this.tag.attributes[this.attribName] = "";
            this.attribValue = "";
            this.emitNode("attribute", {
              name: this.attribName,
              value: ""
            });
            this.attribName = "";
            if (c === ">") {
              this.openTag();
            } else if (isMatch(nameStart, c)) {
              this.attribName = c;
              this.state = S.ATTRIB_NAME;
            } else {
              this.strictFail("Invalid attribute name");
              this.state = S.ATTRIB;
            }
          }
          continue;
        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue;
          } else if (isQuote(c)) {
            this.q = c;
            this.state = S.ATTRIB_VALUE_QUOTED;
          } else {
            this.strictFail("Unquoted attribute value");
            this.state = S.ATTRIB_VALUE_UNQUOTED;
            this.attribValue = c;
          }
          continue;
        case S.ATTRIB_VALUE_QUOTED:
          if (c !== this.q) {
            if (c === "&") {
              this.state = S.ATTRIB_VALUE_ENTITY_Q;
            } else {
              this.attribValue += c;
            }
            continue;
          }
          this.attrib();
          this.q = "";
          this.state = S.ATTRIB_VALUE_CLOSED;
          continue;
        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            this.state = S.ATTRIB;
          } else if (c === ">") {
            this.openTag();
          } else if (c === "/") {
            this.state = S.OPEN_TAG_SLASH;
          } else if (isMatch(nameStart, c)) {
            this.strictFail("No whitespace between attributes");
            this.attribName = c;
            this.attribValue = "";
            this.state = S.ATTRIB_NAME;
          } else {
            this.strictFail("Invalid attribute name");
          }
          continue;
        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === "&") {
              this.state = S.ATTRIB_VALUE_ENTITY_U;
            } else {
              this.attribValue += c;
            }
            continue;
          }
          this.attrib();
          if (c === ">") {
            this.openTag();
          } else {
            this.state = S.ATTRIB;
          }
          continue;
        case S.CLOSE_TAG:
          if (!this.tagName) {
            if (isWhitespace(c)) {
              continue;
            } else if (notMatch(nameStart, c)) {
              if (this.script) {
                this.script += "</" + c;
                this.state = S.SCRIPT;
              } else {
                this.strictFail("Invalid tagname in closing tag.");
              }
            } else {
              this.tagName = c;
            }
          } else if (c === ">") {
            this.closeTag();
          } else if (isMatch(nameBody, c)) {
            this.tagName += c;
          } else if (this.script) {
            this.script += "</" + this.tagName;
            this.tagName = "";
            this.state = S.SCRIPT;
          } else {
            if (!isWhitespace(c)) {
              this.strictFail("Invalid tagname in closing tag");
            }
            this.state = S.CLOSE_TAG_SAW_WHITE;
          }
          continue;
        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue;
          }
          if (c === ">") {
            this.closeTag();
          } else {
            this.strictFail("Invalid characters in closing tag");
          }
          continue;
        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          let returnState;
          let buffer;
          switch (this.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT;
              buffer = "textNode";
              break;
            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED;
              buffer = "attribValue";
              break;
            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED;
              buffer = "attribValue";
              break;
          }
          if (c === ";") {
            this[buffer] += this.parseEntity();
            this.entity = "";
            this.state = returnState;
          } else if (isMatch(this.entity.length ? entityBody : entityStart, c)) {
            this.entity += c;
          } else {
            this.strictFail("Invalid character in entity name");
            this[buffer] += "&" + this.entity + c;
            this.entity = "";
            this.state = returnState;
          }
          continue;
        default:
          throw new Error("Unknown state: " + this.state);
      }
    }
    if (this.position >= this.bufferCheckPosition) {
      this.checkBufferLength();
    }
    return this;
  }
  openTag(selfClosing) {
    if (this.opt.xmlns) {
      let tag = this.tag;
      let qn = qname(this.tagName);
      tag.prefix = qn.prefix;
      tag.local = qn.local;
      tag.uri = tag.ns[qn.prefix] || "";
      if (tag.prefix && !tag.uri) {
        this.strictFail("Unbound namespace prefix: " + JSON.stringify(this.tagName));
        tag.uri = qn.prefix;
      }
      let parent = this.tags[this.tags.length - 1] || this;
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach((p) => {
          this.emitNode("opennamespace", {
            prefix: p,
            uri: tag.ns[p]
          });
        });
      }
      for (let i = 0, l = this.attribList.length; i < l; i++) {
        let nv = this.attribList[i];
        let name = nv[0];
        let value = nv[1];
        let qualName = qname(name, true);
        let prefix = qualName.prefix;
        let local = qualName.local;
        let uri = prefix === "" ? "" : tag.ns[prefix] || "";
        let a = {
          name,
          value,
          prefix,
          local,
          uri
        };
        if (prefix && prefix !== "xmlns" && !uri) {
          this.strictFail("Unbound namespace prefix: " + JSON.stringify(prefix));
          a.uri = prefix;
        }
        this.tag.attributes[name] = a;
        this.emitNode("attribute", a);
      }
      this.attribList.length = 0;
    }
    this.tag.isSelfClosing = !!selfClosing;
    this.sawRoot = true;
    this.tags.push(this.tag);
    this.emitNode("opentag", this.tag);
    if (!selfClosing) {
      if (!this.noscript && this.tagName.toLowerCase() === "script") {
        this.state = S.SCRIPT;
      } else {
        this.state = S.TEXT;
      }
      this.tag = null;
      this.tagName = "";
    }
    this.attribName = this.attribValue = "";
    this.attribList.length = 0;
  }
  closeTag() {
    if (!this.tagName) {
      this.strictFail("Weird empty close tag.");
      this.textNode += "</>";
      this.state = S.TEXT;
      return;
    }
    if (this.script) {
      if (this.tagName !== "script") {
        this.script += "</" + this.tagName + ">";
        this.tagName = "";
        this.state = S.SCRIPT;
        return;
      }
      this.emitNode("script", this.script);
      this.script = "";
    }
    let t = this.tags.length;
    let tagName = this.tagName;
    if (!this.strict) {
      tagName = tagName[this.looseCase]();
    }
    let closeTo = tagName;
    while (t--) {
      let close = this.tags[t];
      if (close.name !== closeTo) {
        this.strictFail("Unexpected close tag");
      } else {
        break;
      }
    }
    if (t < 0) {
      this.strictFail("Unmatched closing tag: " + this.tagName);
      this.textNode += "</" + this.tagName + ">";
      this.state = S.TEXT;
      return;
    }
    this.tagName = tagName;
    let s = this.tags.length;
    while (s-- > t) {
      let tag = this.tag = this.tags.pop();
      this.tagName = this.tag.name;
      if (this.opt.extractRawTagContentEnabled && this.path.join("/") === this.opt.extractRawTagContent) {
        this.emitNode("extractedrawtag", fix_indent(this.rawTagExtract));
        this.rawTagExtract = "";
        this.rawTagTracking = false;
      }
      this.path.pop();
      this.emitNode("closetag", this.tagName);
      let x = {};
      for (let i in tag.ns) {
        x[i] = tag.ns[i];
      }
      let parent = this.tags[this.tags.length - 1] || this;
      if (this.opt.xmlns && tag.ns !== parent.ns) {
        Object.keys(tag.ns).forEach((p) => {
          let n = tag.ns[p];
          this.emitNode("closenamespace", { prefix: p, uri: n });
        });
      }
    }
    if (t === 0)
      this.closedRoot = true;
    this.tagName = this.attribValue = this.attribName = "";
    this.attribList.length = 0;
    this.state = S.TEXT;
  }
  checkBufferLength() {
    let maxAllowed = Math.max(this.MAX_BUFFER_LENGTH, 10);
    let maxActual = 0;
    for (let i = 0, l = buffers.length; i < l; i++) {
      let len = this[buffers[i]].length;
      if (len > maxAllowed) {
        switch (buffers[i]) {
          case "textNode":
            this.closeText();
            break;
          case "cdata":
            this.emitNode("cdata", this.cdata);
            this.cdata = "";
            break;
          case "script":
            this.emitNode("script", this.script);
            this.script = "";
            break;
          default:
            this._error("Max buffer length exceeded: " + buffers[i]);
        }
      }
      maxActual = Math.max(maxActual, len);
    }
    let m = this.MAX_BUFFER_LENGTH - maxActual;
    this.bufferCheckPosition = m + this.position;
  }
  newTag() {
    if (!this.strict)
      this.tagName = this.tagName[this.looseCase]();
    let parent = this.tags[this.tags.length - 1] || this;
    let tag = this.tag = { name: this.tagName, attributes: {} };
    if (this.opt.xmlns) {
      tag.ns = parent.ns;
    }
    this.attribList.length = 0;
    this.path.push(this.tagName);
    if (this.opt.extractRawTagContentEnabled && this.path.join("/") === this.opt.extractRawTagContent) {
      this.rawTagExtract = `<${this.tagName} `;
      this.rawTagTracking = true;
    }
    this.emitNode("opentagstart", tag);
  }
  _error(errorMessage) {
    this.closeText();
    if (this.trackPosition) {
      errorMessage += "\nLine: " + this.line + "\nColumn: " + this.column + "\nChar: " + this.c;
    }
    const error = new Error(errorMessage);
    this.error = error;
    this.emit("error", error);
    return this;
  }
  strictFail(message) {
    if (this.strict) {
      this._error(message);
    }
  }
  attrib() {
    if (!this.strict) {
      this.attribName = this.attribName[this.looseCase]();
    }
    if (this.attribList.indexOf(this.attribName) !== -1 || this.tag.attributes.hasOwnProperty(this.attribName)) {
      this.attribName = this.attribValue = "";
      return;
    }
    if (this.opt.xmlns) {
      let qn = qname(this.attribName, true);
      let prefix = qn.prefix;
      let local = qn.local;
      if (prefix === "xmlns") {
        if (local === "xml" && this.attribValue !== XML_NAMESPACE) {
          this.strictFail("xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + this.attribValue);
        } else if (local === "xmlns" && this.attribValue !== XMLNS_NAMESPACE) {
          this.strictFail("xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + this.attribValue);
        } else {
          let tag = this.tag;
          let parent = this.tags[this.tags.length - 1] || this;
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns);
          }
          tag.ns[local] = this.attribValue;
        }
      }
      this.attribList.push([this.attribName, this.attribValue]);
    } else {
      this.tag.attributes[this.attribName] = this.attribValue;
      this.emitNode("attribute", {
        name: this.attribName,
        value: this.attribValue
      });
    }
    this.attribName = this.attribValue = "";
  }
  parseEntity() {
    let entity = this.entity;
    let entityLC = entity.toLowerCase();
    let num;
    let numStr = "";
    if (this.ENTITIES[entity]) {
      return this.ENTITIES[entity];
    }
    if (this.ENTITIES[entityLC]) {
      return this.ENTITIES[entityLC];
    }
    entity = entityLC;
    if (entity.charAt(0) === "#") {
      if (entity.charAt(1) === "x") {
        entity = entity.slice(2);
        num = parseInt(entity, 16);
        numStr = num.toString(16);
      } else {
        entity = entity.slice(1);
        num = parseInt(entity, 10);
        numStr = num.toString(10);
      }
    }
    entity = entity.replace(/^0+/, "");
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      this.strictFail("Invalid character entity");
      return "&" + this.entity + ";";
    }
    return String.fromCodePoint(num);
  }
  beginWhiteSpace(c) {
    if (c === "<") {
      this.state = S.OPEN_WAKA;
      this.startTagPosition = this.position;
    } else if (!isWhitespace(c)) {
      this.strictFail("Non-whitespace before first tag.");
      this.textNode = c;
      this.state = S.TEXT;
    }
  }
}
__name(SAXParser, "SAXParser");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ENTITIES,
  EventTypes,
  NodeTypes,
  SAXParser
});
