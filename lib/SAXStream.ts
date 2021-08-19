import { Duplex, Transform } from "stream"
import { StringDecoder } from "string_decoder";


import { NodeTypes, SAXParser, NodeType, ENodeTypes } from './SAXParser.js';


export type SAXAttribute    = {name: string, value: string}
export type SAXOpenTagStart = {name: string}
export type SAXCloseTag     = {name: string}
export type SAXOpenCData    = {}
export type SAXCloseCData   = {}

export type SAXTag = {
  name: string,
  attributes: {[key: string]: string},
  isSelfClosing: boolean
}

export type SAXText  = string
export type SAXCData = string

// export type SAXData = SAXAttribute

// export type SAXDataEvent = {
//   nodeType: NodeType,
//   data?: SAXData
// }
export type SAXDataEvent =
    {nodeType: ENodeTypes.attribute,    data: SAXAttribute}
  | {nodeType: ENodeTypes.opentagstart, data: SAXOpenTagStart}
  | {nodeType: ENodeTypes.opentag,      data: SAXTag}
  | {nodeType: ENodeTypes.closetag,     data: SAXCloseTag}
  | {nodeType: ENodeTypes.text,         data: SAXText}
  | {nodeType: ENodeTypes.cdata,        data: SAXCData}
  | {nodeType: ENodeTypes.opencdata,    data: SAXOpenCData}
  | {nodeType: ENodeTypes.closecdata,   data: SAXCloseCData}


export class SAXStream extends Transform {
  private _parser: SAXParser
  private buffer: SAXDataEvent[] = []
  private _decoder = new StringDecoder('utf8')

  constructor(strict: boolean = false, opt = {}) {
    super({
      readableObjectMode: true
    })
    this._parser = new SAXParser(strict, opt)

    this._parser.on('end', () => {
      this.emit('end')
    })

    this._parser.on('error', er => {
      this.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      this._parser.error = null
    })
  }

  emitNodeTypes(...nodeTypes: NodeType[]) {
    for(const nodeType of nodeTypes) {
      if(this._parser.listenerCount(nodeType) === 0) {
        this._parser.on(nodeType, (data) => {
          // console.log(data)
          // this.push(this.buffer.length > 0 ? this.alsoEmit(this.buffer.shift()) : null)
          this.push(this.alsoEmit({
            nodeType: nodeType,
            data: data
          }))
        })
      }
    }
  }

  emitAllNodeTypes() {
    this.emitNodeTypes(...NodeTypes)
  }

  onXml(event: NodeType, listener: (...args: any[]) => void): SAXStream {
    return this.on(event, listener)
  }

  onXmlEvent(listener: (nodeType: NodeType, data: any) => void): SAXStream {
    return this.on('data', ({nodeType, data}) => listener(nodeType, data))
  }

  private alsoEmit(event: SAXDataEvent): SAXDataEvent {
    this.emit(event.nodeType, event.data)
    return event;
  }

  _destroy(err, callback) {
    this.buffer = []
    callback(err);
  }

  // Writable methods
  _write(chunk, encoding, callback) {
    // The underlying source only deals with strings.
    if (Buffer.isBuffer(chunk)) {
      // console.log(`chunk before:`, chunk, chunk.length)
      chunk = this._decoder.write(chunk)
      // console.log(`chunk:`, chunk, chunk.length)
      // const end = this._decoder.end()
      // if(end.length > 0) {
      //   throw new Error(`Error: unsupported partial chunks of unicode strings, string decoder 'end' method returned non-zero length string from internal buffer: ${end}`)
      // }
    }
    this._parser.write(chunk.toString())
    callback();
  }

  // SAXStream.prototype.write = function (data) {
  //   if (typeof Buffer === 'function' &&
  //     typeof Buffer.isBuffer === 'function' &&
  //     Buffer.isBuffer(data)) {
  //     if (!this._decoder) {
  //       let SD = require('string_decoder').StringDecoder
  //       this._decoder = new SD('utf8')
  //     }
  //     data = this._decoder.write(data)
  //   }

  //   this._parser.write(data.toString())
  //   this.emit('data', data)
  //   return true
  // }


  // SAXStream.prototype.end = function (chunk) {
  _final(callback) {
    this._parser.end()
    callback()
  }
}

