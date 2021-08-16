import _ from "lodash"
import SAXEntities from "./SAXEntities"
import xmlBeautifier from './xml-beautifier';
import { EventEmitter } from 'stream';

const MAX_BUFFER_LENGTH = 64 * 1024

type Attribute = {
  name: string,
  value: string,
  prefix: string,
  local: string,
  uri: string
}

type Tag = {
  name: string,
  attributes: {[key: string]: Attribute | string},
  local?: string,
  prefix?: string,
  uri?: string,
  isSelfClosing?: boolean,
  ns?: {[key: string]: string}
}

export type NodeType = 'onopencdata'
| 'onsgmldeclaration'
| 'ondoctype'
| 'oncomment'
| 'onclosecdata'
| 'onprocessinginstruction'
| 'onopennamespace'
| 'onopentag'
| 'onextractedrawtag'
| 'onclosetag'
| 'onclosenamespace'
| 'oncdata'
| 'onscript'
| 'onopentagstart'
| 'onattribute'
| 'ontext'

export type EventType = NodeType | 'onready' | 'onend' | 'onerror'

export const NodeTypes: NodeType[] = ['onopencdata',
 'onsgmldeclaration',
 'ondoctype',
 'oncomment',
 'onclosecdata',
 'onprocessinginstruction',
 'onopennamespace',
 'onopentag',
 'onextractedrawtag',
 'onclosetag',
 'onclosenamespace',
 'oncdata',
 'onscript',
 'onopentagstart',
 'onattribute',
 'ontext']

export const EventTypes: EventType[] = (NodeTypes as EventType[]).concat(['onready', 'onend', 'onerror'])

// this really needs to be replaced with character classes.
// XML allows all manner of ridiculous numbers and digits.
var CDATA = '[CDATA['
var DOCTYPE = 'DOCTYPE'
var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

// http://www.w3.org/TR/REC-xml/#NT-NameStartChar
// This implementation works on strings, a single character at a time
// as such, it cannot ever support astral-plane characters (10000-EFFFF)
// without a significant breaking change to either this  parser, or the
// JavaScript language.  Implementation of an emoji-capable xml parser
// is left as an exercise for the reader.
var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

function isWhitespace (c) {
  return c === ' ' || c === '\n' || c === '\r' || c === '\t'
}

function isQuote (c) {
  return c === '"' || c === '\''
}

function isAttribEnd (c) {
  return c === '>' || isWhitespace(c)
}

function isMatch (regex, c) {
  return regex.test(c)
}

function notMatch (regex, c) {
  return !isMatch(regex, c)
}

type StateName = 'BEGIN'
  | 'BEGIN_WHITESPACE'
  | 'TEXT'
  | 'TEXT_ENTITY'
  | 'OPEN_WAKA'
  | 'SGML_DECL'
  | 'SGML_DECL_QUOTED'
  | 'DOCTYPE'
  | 'DOCTYPE_QUOTED'
  | 'DOCTYPE_DTD'
  | 'DOCTYPE_DTD_QUOTED'
  | 'COMMENT_STARTING'
  | 'COMMENT'
  | 'COMMENT_ENDING'
  | 'COMMENT_ENDED'
  | 'CDATA'
  | 'CDATA_ENDING'
  | 'CDATA_ENDING_2'
  | 'PROC_INST'
  | 'PROC_INST_BODY'
  | 'PROC_INST_ENDING'
  | 'OPEN_TAG'
  | 'OPEN_TAG_SLASH'
  | 'ATTRIB'
  | 'ATTRIB_NAME'
  | 'ATTRIB_NAME_SAW_WHITE'
  | 'ATTRIB_VALUE'
  | 'ATTRIB_VALUE_QUOTED'
  | 'ATTRIB_VALUE_CLOSED'
  | 'ATTRIB_VALUE_UNQUOTED'
  | 'ATTRIB_VALUE_ENTITY_Q'
  | 'ATTRIB_VALUE_ENTITY_U'
  | 'CLOSE_TAG'
  | 'CLOSE_TAG_SAW_WHITE'
  | 'SCRIPT'
  | 'SCRIPT_ENDING'

let _S = 0;
const sax: {
  // STATE?: {[key: StateName]: string|number},
  STATE?: Record<StateName, number>,
  XML_ENTITIES?: {[key: string]: string},
  ENTITIES?: {[key: string|number]: string|number},
} = {};

sax.STATE = {
  BEGIN: _S++, // leading byte order mark or whitespace
  BEGIN_WHITESPACE: _S++, // leading whitespace
  TEXT: _S++, // general stuff
  TEXT_ENTITY: _S++, // &amp and such.
  OPEN_WAKA: _S++, // <
  SGML_DECL: _S++, // <!BLARG
  SGML_DECL_QUOTED: _S++, // <!BLARG foo "bar
  DOCTYPE: _S++, // <!DOCTYPE
  DOCTYPE_QUOTED: _S++, // <!DOCTYPE "//blah
  DOCTYPE_DTD: _S++, // <!DOCTYPE "//blah" [ ...
  DOCTYPE_DTD_QUOTED: _S++, // <!DOCTYPE "//blah" [ "foo
  COMMENT_STARTING: _S++, // <!-
  COMMENT: _S++, // <!--
  COMMENT_ENDING: _S++, // <!-- blah -
  COMMENT_ENDED: _S++, // <!-- blah --
  CDATA: _S++, // <![CDATA[ something
  CDATA_ENDING: _S++, // ]
  CDATA_ENDING_2: _S++, // ]]
  PROC_INST: _S++, // <?hi
  PROC_INST_BODY: _S++, // <?hi there
  PROC_INST_ENDING: _S++, // <?hi "there" ?
  OPEN_TAG: _S++, // <strong
  OPEN_TAG_SLASH: _S++, // <strong /
  ATTRIB: _S++, // <a
  ATTRIB_NAME: _S++, // <a foo
  ATTRIB_NAME_SAW_WHITE: _S++, // <a foo _
  ATTRIB_VALUE: _S++, // <a foo=
  ATTRIB_VALUE_QUOTED: _S++, // <a foo="bar
  ATTRIB_VALUE_CLOSED: _S++, // <a foo="bar"
  ATTRIB_VALUE_UNQUOTED: _S++, // <a foo=bar
  ATTRIB_VALUE_ENTITY_Q: _S++, // <foo bar="&quot;"
  ATTRIB_VALUE_ENTITY_U: _S++, // <foo bar=&quot
  CLOSE_TAG: _S++, // </a
  CLOSE_TAG_SAW_WHITE: _S++, // </a   >
  SCRIPT: _S++, // <script> ...
  SCRIPT_ENDING: _S++ // <script> ... <
}

sax.XML_ENTITIES = {
  'amp': '&',
  'gt': '>',
  'lt': '<',
  'quot': '"',
  'apos': "'"
}

sax.ENTITIES = _.clone(SAXEntities);


function textopts (opt, text) {
  if (opt.trim) text = text.trim()
  if (opt.normalize) text = text.replace(/\s+/g, ' ')
  return text
}


function qname (name, attribute?) {
  var i = name.indexOf(':')
  var qualName = i < 0 ? [ '', name ] : name.split(':')
  var prefix = qualName[0]
  var local = qualName[1]

  // <x "xmlns"="http://foo">
  if (attribute && name === 'xmlns') {
    prefix = 'xmlns'
    local = ''
  }

  return { prefix: prefix, local: local }
}



function charAt (chunk, i) {
  var result = ''
  if (i < chunk.length) {
    result = chunk.charAt(i)
  }
  return result
}

function fix_indent(xml) {
  return xmlBeautifier(xml, 2);
}


Object.keys(sax.ENTITIES).forEach(function (key) {
  var e = sax.ENTITIES[key]
  var s = typeof e === 'number' ? String.fromCharCode(e) : e
  sax.ENTITIES[key] = s
})

for (var s in sax.STATE) {
  sax.STATE[sax.STATE[s]] = s
}

// shorthand
let S = sax.STATE

const buffers: BufferName[] = [
  'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
  'procInstName', 'procInstBody', 'entity', 'attribName',
  'attribValue', 'cdata', 'script'
]

type BufferName = 'comment' | 'sgmlDecl' | 'textNode' | 'tagName' | 'doctype'
  | 'procInstName' | 'procInstBody' | 'entity' | 'attribName'
  | 'attribValue' | 'cdata' | 'script'

export class SAXParser extends EventEmitter implements Record<BufferName, string> {
  sawRoot: boolean;
  closedRoot: any;
  state: any;
  c: string;
  closed: boolean;
  q: string;
  bufferCheckPosition: any;
  opt: any;
  looseCase: string;
  tags: any[];
  tag: Tag;
  strict: boolean;
  noscript: boolean;
  strictEntities: any;
  ENTITIES: any;
  attribList: any[];
  rawTagTracking: boolean;
  rawTagExtract: string;
  path: any[];
  ns: any;
  trackPosition: boolean;
  position: number;
  line: number;
  column: number;
  error: Error;
  startTagPosition: number;
  
  // buffers
  cdata: string;
  script: string;
  procInstName: string;
  procInstBody: string;
  attribName: string;
  attribValue: string;
  entity: string;
  tagName: string;
  comment: string;
  doctype: string;
  sgmlDecl: string;
  textNode: string;

  constructor(strict: boolean, opt) {
    super()
    this.strict = strict
    this.opt = opt
  }

  private clearBuffers () {
    for (var i = 0, l = buffers.length; i < l; i++) {
      this[buffers[i]] = ''
    }
  }

  reset() {
    this.clearBuffers()
    this.q = this.c = ''
    this.bufferCheckPosition = MAX_BUFFER_LENGTH
    this.opt = this.opt || {}
    this.opt.lowercase = this.opt.lowercase || this.opt.lowercasetags
    this.looseCase = this.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    this.tags = []
    this.closed = this.closedRoot = this.sawRoot = false
    this.tag = this.error = null
    this.noscript = !!(this.strict || this.opt.noscript)
    this.state = S.BEGIN
    this.strictEntities = this.opt.strictEntities
    this.ENTITIES = this.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    this.attribList = []

    this.opt.extractRawTagContent = this.opt.extractRawTagContent || null
    this.opt.extractRawTagContentEnabled = !!this.opt.extractRawTagContent
    if(this.opt.extractRawTagContentEnabled) {
      this.rawTagTracking = false
      this.rawTagExtract = ''
    }
    this.path = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (this.opt.xmlns) {
      this.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    this.trackPosition = this.opt.position !== false
    if (this.trackPosition) {
      this.position = this.line = this.column = 0
    }
    this.emit('onready')
  }

  end(): SAXParser {
    if (this.sawRoot && !this.closedRoot) this.strictFail('Unclosed root tag')
    if ((this.state !== S.BEGIN) &&
      (this.state !== S.BEGIN_WHITESPACE) &&
      (this.state !== S.TEXT)) {
      this._error('Unexpected end')
    }
    this.closeText()
    this.c = ''
    this.closed = true
    this.emit('onend')
    this.reset()
    return this
  }

  resume(): SAXParser {
    this.error = null;
    return this;
  }

  close() {
    this.write(null)
  }

  flush() {
    this.flushBuffers()
  }

  private flushBuffers () {
    this.closeText()
    if (this.cdata !== '') {
      this.emitNode('oncdata', this.cdata)
      this.cdata = ''
    }
    if (this.script !== '') {
      this.emitNode('onscript', this.script)
      this.script = ''
    }
  }

  private emitNode (nodeType: NodeType, data?) {
    if (this.textNode) {
      this.closeText()
    }
    this.emit(nodeType, data)
  }
  
  private closeText() {
    this.textNode = textopts(this.opt, this.textNode)
    if (this.textNode) {
      this.emit('ontext', this.textNode)
    }
    this.textNode = ''
  }
 
  write (chunk: string | Buffer) {
    if (this.error) {
      throw this.error
    }
    if (this.closed) {
      return this._error(
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return this.end()
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      this.c = c

      if(this.rawTagTracking) {
        this.rawTagExtract += c
      }
      // process.stdout.write(c)

      if (!c) {
        break
      }

      if (this.trackPosition) {
        this.position++
        if (c === '\n') {
          this.line++
          this.column = 0
        } else {
          this.column++
        }
      }


      switch (this.state) {
        case S.BEGIN:
          this.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          this.beginWhiteSpace(c)
          continue

        case S.BEGIN_WHITESPACE:
          this.beginWhiteSpace(c)
          continue

        case S.TEXT:
          if (this.sawRoot && !this.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if(this.rawTagTracking) {
                this.rawTagExtract += c
                // process.stdout.write(chalk.green(c))
              }
              if (c && this.trackPosition) {
                this.position++
                if (c === '\n') {
                  this.line++
                  this.column = 0
                } else {
                  this.column++
                }
              }
            }
            this.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(this.sawRoot && this.closedRoot && !this.strict)) {
            // process.stdout.write(chalk.yellow.bold('<'))
            this.state = S.OPEN_WAKA
            this.startTagPosition = this.position
          } else {
            if (!isWhitespace(c) && (!this.sawRoot || this.closedRoot)) {
              this.strictFail('Text data outside of root node.')
            }
            if (c === '&') {
              this.state = S.TEXT_ENTITY
            } else {
              this.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            this.state = S.SCRIPT_ENDING
          } else {
            this.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            this.state = S.CLOSE_TAG
          } else {
            this.script += '<' + c
            this.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            this.state = S.SGML_DECL
            this.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            // wait for it...
          } else if (isMatch(nameStart, c)) {
            this.state = S.OPEN_TAG
            this.tagName = c
          } else if (c === '/') {
            this.state = S.CLOSE_TAG
            this.tagName = ''
          } else if (c === '?') {
            this.state = S.PROC_INST
            this.procInstName = this.procInstBody = ''
          } else {
            this.strictFail('Unencoded <')
            // if there was some whitespace, then add that in.
            if (this.startTagPosition + 1 < this.position) {
              var pad = this.position - this.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            this.textNode += '<' + c
            this.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((this.sgmlDecl + c).toUpperCase() === CDATA) {
            this.emitNode('onopencdata')
            this.state = S.CDATA
            this.sgmlDecl = ''
            this.cdata = ''
          } else if (this.sgmlDecl + c === '--') {
            this.state = S.COMMENT
            this.comment = ''
            this.sgmlDecl = ''
          } else if ((this.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            this.state = S.DOCTYPE
            if (this.doctype || this.sawRoot) {
              this.strictFail(                'Inappropriately located doctype declaration')
            }
            this.doctype = ''
            this.sgmlDecl = ''
          } else if (c === '>') {
            this.emitNode('onsgmldeclaration', this.sgmlDecl)
            this.sgmlDecl = ''
            this.state = S.TEXT
          } else if (isQuote(c)) {
            this.state = S.SGML_DECL_QUOTED
            this.sgmlDecl += c
          } else {
            this.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === this.q) {
            this.state = S.SGML_DECL
            this.q = ''
          }
          this.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            this.state = S.TEXT
            this.emitNode('ondoctype', this.doctype)
            this.doctype = '<saxparser_true>' // just remember that we saw it.
          } else {
            this.doctype += c
            if (c === '[') {
              this.state = S.DOCTYPE_DTD
            } else if (isQuote(c)) {
              this.state = S.DOCTYPE_QUOTED
              this.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          this.doctype += c
          if (c === this.q) {
            this.q = ''
            this.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          this.doctype += c
          if (c === ']') {
            this.state = S.DOCTYPE
          } else if (isQuote(c)) {
            this.state = S.DOCTYPE_DTD_QUOTED
            this.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          this.doctype += c
          if (c === this.q) {
            this.state = S.DOCTYPE_DTD
            this.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            this.state = S.COMMENT_ENDING
          } else {
            this.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            this.state = S.COMMENT_ENDED
            this.comment = textopts(this.opt, this.comment)
            if (this.comment) {
              this.emitNode('oncomment', this.comment)
            }
            this.comment = ''
          } else {
            this.comment += '-' + c
            this.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            this.strictFail('Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            this.comment += '--' + c
            this.state = S.COMMENT
          } else {
            this.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            this.state = S.CDATA_ENDING
          } else {
            this.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            this.state = S.CDATA_ENDING_2
          } else {
            this.cdata += ']' + c
            this.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (this.cdata) {
              this.emitNode('oncdata', this.cdata)
            }
            this.emitNode('onclosecdata')
            this.cdata = ''
            this.state = S.TEXT
          } else if (c === ']') {
            this.cdata += ']'
          } else {
            this.cdata += ']]' + c
            this.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            this.state = S.PROC_INST_ENDING
          } else if (isWhitespace(c)) {
            this.state = S.PROC_INST_BODY
          } else {
            this.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!this.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            this.state = S.PROC_INST_ENDING
          } else {
            this.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            this.emitNode('onprocessinginstruction', {
              name: this.procInstName,
              body: this.procInstBody
            })
            this.procInstName = this.procInstBody = ''
            this.state = S.TEXT
          } else {
            this.procInstBody += '?' + c
            this.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            this.tagName += c
          } else {
            this.newTag()
            if (c === '>') {
              this.openTag()
            } else if (c === '/') {
              this.state = S.OPEN_TAG_SLASH
            } else {
              if (!isWhitespace(c)) {
                this.strictFail('Invalid character in tag name')
              }
              this.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            this.openTag(true)
            this.closeTag()
          } else {
            this.strictFail('Forward-slash in opening tag not followed by >')
            this.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            this.openTag()
          } else if (c === '/') {
            this.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            this.attribName = c
            this.attribValue = ''
            this.state = S.ATTRIB_NAME
          } else {
            this.strictFail('Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            this.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            this.strictFail('Attribute without value')
            this.attribValue = this.attribName
            this.attrib()
            this.openTag()
          } else if (isWhitespace(c)) {
            this.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (isMatch(nameBody, c)) {
            this.attribName += c
          } else {
            this.strictFail('Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            this.state = S.ATTRIB_VALUE
          } else if (isWhitespace(c)) {
            continue
          } else {
            this.strictFail('Attribute without value')
            this.tag.attributes[this.attribName] = ''
            this.attribValue = ''
            this.emitNode('onattribute', {
              name: this.attribName,
              value: ''
            })
            this.attribName = ''
            if (c === '>') {
              this.openTag()
            } else if (isMatch(nameStart, c)) {
              this.attribName = c
              this.state = S.ATTRIB_NAME
            } else {
              this.strictFail('Invalid attribute name')
              this.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            this.q = c
            this.state = S.ATTRIB_VALUE_QUOTED
          } else {
            this.strictFail('Unquoted attribute value')
            this.state = S.ATTRIB_VALUE_UNQUOTED
            this.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== this.q) {
            if (c === '&') {
              this.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              this.attribValue += c
            }
            continue
          }
          this.attrib()
          this.q = ''
          this.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            this.state = S.ATTRIB
          } else if (c === '>') {
            this.openTag()
          } else if (c === '/') {
            this.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            this.strictFail('No whitespace between attributes')
            this.attribName = c
            this.attribValue = ''
            this.state = S.ATTRIB_NAME
          } else {
            this.strictFail('Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              this.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              this.attribValue += c
            }
            continue
          }
          this.attrib()
          if (c === '>') {
            this.openTag()
          } else {
            this.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!this.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (this.script) {
                this.script += '</' + c
                this.state = S.SCRIPT
              } else {
                this.strictFail('Invalid tagname in closing tag.')
              }
            } else {
              this.tagName = c
            }
          } else if (c === '>') {
            this.closeTag()
          } else if (isMatch(nameBody, c)) {
            this.tagName += c
          } else if (this.script) {
            this.script += '</' + this.tagName
            this.tagName = ''
            this.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) {
              this.strictFail('Invalid tagname in closing tag')
            }
            this.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            this.closeTag()
          } else {
            this.strictFail('Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (this.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            this[buffer] += this.parseEntity()
            this.entity = ''
            this.state = returnState
          } else if (isMatch(this.entity.length ? entityBody : entityStart, c)) {
            this.entity += c
          } else {
            this.strictFail('Invalid character in entity name')
            this[buffer] += '&' + this.entity + c
            this.entity = ''
            this.state = returnState
          }

          continue

        default:
          throw new Error('Unknown state: ' + this.state)
      }
    } // while

    if (this.position >= this.bufferCheckPosition) {
      this.checkBufferLength()
    }
    return this
  }

  openTag (selfClosing?) {
    if (this.opt.xmlns) {
      // emit namespace binding events
      var tag = this.tag

      // add namespace info to tag
      var qn = qname(this.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        this.strictFail('Unbound namespace prefix: ' +
          JSON.stringify(this.tagName))
        tag.uri = qn.prefix
      }

      var parent = this.tags[this.tags.length - 1] || this
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          this.emitNode('onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = this.attribList.length; i < l; i++) {
        var nv = this.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          this.strictFail('Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        this.tag.attributes[name] = a
        this.emitNode('onattribute', a)
      }
      this.attribList.length = 0
    }

    this.tag.isSelfClosing = !!selfClosing

    // process the tag
    this.sawRoot = true
    this.tags.push(this.tag)
    this.emitNode('onopentag', this.tag)
    // process.stdout.write(chalk.blue.bold(`<${parser.tag.name}>`))
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!this.noscript && this.tagName.toLowerCase() === 'script') {
        this.state = S.SCRIPT
      } else {
        this.state = S.TEXT
      }
      this.tag = null
      this.tagName = ''
    }
    this.attribName = this.attribValue = ''
    this.attribList.length = 0
  }

  closeTag () {
    if (!this.tagName) {
      this.strictFail('Weird empty close tag.')
      this.textNode += '</>'
      this.state = S.TEXT
      return
    }
  
    if (this.script) {
      if (this.tagName !== 'script') {
        this.script += '</' + this.tagName + '>'
        this.tagName = ''
        this.state = S.SCRIPT
        return
      }
      this.emitNode('onscript', this.script)
      this.script = ''
    }
  
    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = this.tags.length
    var tagName = this.tagName
    if (!this.strict) {
      tagName = tagName[this.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = this.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        this.strictFail('Unexpected close tag')
      } else {
        break
      }
    }
  
    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      this.strictFail('Unmatched closing tag: ' + this.tagName)
      this.textNode += '</' + this.tagName + '>'
      this.state = S.TEXT
      return
    }
    this.tagName = tagName
    var s = this.tags.length
    while (s-- > t) {
      var tag = this.tag = this.tags.pop()
      this.tagName = this.tag.name
      // console.log('close:', parser.path.join('/'))
      if(this.opt.extractRawTagContentEnabled && this.path.join('/') === this.opt.extractRawTagContent) {
        // console.log(' -- stop tracking')
        // console.log(parser.rawTagExtract);
        this.emitNode('onextractedrawtag', fix_indent(this.rawTagExtract))
        this.rawTagExtract = ''
        this.rawTagTracking = false
        // process.stdout.write(chalk.red.bold(`<${parser.tagName}>`))
      }
      this.path.pop()
      this.emitNode('onclosetag', this.tagName)
  
      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }
  
      var parent = this.tags[this.tags.length - 1] || this
      if (this.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          this.emitNode('onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) this.closedRoot = true
    this.tagName = this.attribValue = this.attribName = ''
    this.attribList.length = 0
    this.state = S.TEXT
  }
  
  private checkBufferLength () {
    var maxAllowed = Math.max(MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = this[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            this.closeText()
            break

          case 'cdata':
            this.emitNode('oncdata', this.cdata)
            this.cdata = ''
            break

          case 'script':
            this.emitNode('onscript', this.script)
            this.script = ''
            break

          default:
            this._error('Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = MAX_BUFFER_LENGTH - maxActual
    this.bufferCheckPosition = m + this.position
  }

  private newTag () {
    if (!this.strict) this.tagName = this.tagName[this.looseCase]()
    var parent = this.tags[this.tags.length - 1] || this
    var tag: Tag = this.tag = { name: this.tagName, attributes: {} }
  
    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (this.opt.xmlns) {
      tag.ns = parent.ns
    }
    this.attribList.length = 0
    
    this.path.push(this.tagName)
  
    // console.log('open:', parser.path.join('/'))
    if(this.opt.extractRawTagContentEnabled && this.path.join('/') === this.opt.extractRawTagContent) {
      this.rawTagExtract = `<${this.tagName} `
      this.rawTagTracking = true
      // console.log(' -- start tracking')
      // process.stdout.write(chalk.yellow.bold(`<${tag.name}>`))
    }
    this.emitNode('onopentagstart', tag)
  }
 
  private _error(errorMessage: string) {
    this.closeText()
    if (this.trackPosition) {
      errorMessage += '\nLine: ' + this.line +
        '\nColumn: ' + this.column +
        '\nChar: ' + this.c
    }
    const error = new Error(errorMessage)
    this.error = error
    this.emit('onerror', error)
    return this
  }
  
  private strictFail (message: string) {
    if (this.strict) {
      this._error(message)
    }
  }
  
  private attrib() {
    if (!this.strict) {
      this.attribName = this.attribName[this.looseCase]()
    }
  
    if (this.attribList.indexOf(this.attribName) !== -1 ||
      this.tag.attributes.hasOwnProperty(this.attribName)) {
      this.attribName = this.attribValue = ''
      return
    }
  
    if (this.opt.xmlns) {
      var qn = qname(this.attribName, true)
      var prefix = qn.prefix
      var local = qn.local
  
      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && this.attribValue !== XML_NAMESPACE) {
          this.strictFail(
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + this.attribValue)
        } else if (local === 'xmlns' && this.attribValue !== XMLNS_NAMESPACE) {
          this.strictFail(
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + this.attribValue)
        } else {
          var tag = this.tag
          var parent = this.tags[this.tags.length - 1] || this
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = this.attribValue
        }
      }
  
      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      this.attribList.push([this.attribName, this.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      this.tag.attributes[this.attribName] = this.attribValue
      this.emitNode('onattribute', {
        name: this.attribName,
        value: this.attribValue
      })
    }
  
    this.attribName = this.attribValue = ''
  }
 
  private parseEntity() {
    var entity = this.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''
  
    if (this.ENTITIES[entity]) {
      return this.ENTITIES[entity]
    }
    if (this.ENTITIES[entityLC]) {
      return this.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      this.strictFail('Invalid character entity')
      return '&' + this.entity + ';'
    }
  
    return String.fromCodePoint(num)
  }
  
  private beginWhiteSpace(c) {
    if (c === '<') {
      this.state = S.OPEN_WAKA
      this.startTagPosition = this.position
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      this.strictFail('Non-whitespace before first tag.')
      this.textNode = c
      this.state = S.TEXT
    }
  }
}