import { Duplex, Transform } from "stream"
import { StringDecoder } from "string_decoder";


import { NodeTypes, SAXParser, NodeType, ENodeTypes } from './SAXParser.js';


export type SAXTagName      = string
export type SAXAttribute    = {name: string, value: string}
export type SAXOpenTagStart = {name: SAXTagName}
export type SAXCloseTag     = SAXTagName
export type SAXOpenCData    = {}
export type SAXCloseCData   = {}
export type SAXTodo         = {}

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
  | {nodeType: ENodeTypes.doctype,      data: SAXTodo}
  | {nodeType: ENodeTypes.comment,      data: SAXTodo}
  | {nodeType: ENodeTypes.processinginstruction,   data: SAXTodo}
  | {nodeType: ENodeTypes.extractedrawtag,         data: SAXTodo}
  | {nodeType: ENodeTypes.sgmldeclaration,         data: SAXTodo}
  | {nodeType: ENodeTypes.opennamespace,           data: SAXTodo}
  | {nodeType: ENodeTypes.closenamespace,          data: SAXTodo}
  | {nodeType: ENodeTypes.script,                  data: SAXTodo}


export class SAXStream extends Transform {
  private _parser: SAXParser
  private buffer: SAXDataEvent[] = []
  private _decoder = new StringDecoder('utf8')


  private ended = false

  constructor(strict: boolean = false, opt: any = {}) {
    super({
      readableObjectMode: true,
      // highWaterMark: opt.highWaterMark || null,
      writableHighWaterMark: opt.highWaterMark || null,
      readableHighWaterMark: opt.objHighWaterMark || 16,
    })
    this._parser = new SAXParser(strict, opt)

    this._parser.on('end', () => {
      // this.emit('end')
    })

    // this._parser.on('error', er => {
    //   this.emit('error', er)

    //   // if didn't throw, then means error was handled.
    //   // go ahead and clear error, so we can write again.
    //   this._parser.error = null
    // })
  }

  emitNodeTypes(...nodeTypes: NodeType[]) {
    // for(const nodeType of nodeTypes) {
    //   if(this._parser.listenerCount(nodeType) === 0) {
    //     this._parser.on(nodeType, (data) => {
    //       // console.log(data)
    //       // this.push(this.buffer.length > 0 ? this.alsoEmit(this.buffer.shift()) : null)
    //       this.push(this.alsoEmit({
    //         nodeType: nodeType,
    //         data: data
    //       }))
    //     })
    //   }
    // }
  }

  emitAllNodeTypes() {
    this.emitNodeTypes(...NodeTypes)
  }

  // onXml(event: NodeType, listener: (...args: any[]) => void): SAXStream {
  //   return this.on(event, listener)
  // }

  // onXmlEvent(listener: (nodeType: NodeType, data: any) => void): SAXStream {
  //   return this.on('data', ({nodeType, data}) => listener(nodeType, data))
  // }

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
    if (Buffer.isBuffer(chunk)) {
      chunk = this._decoder.write(chunk)
    }
    // process.stdout.write('x'.repeat(chunk.length))
    // console.log(`x -- ${chunk.length}`)
    // console.log(`sax stream --`.padStart(15), chunk.length)
    this._parser.write(chunk.toString())
    for(const event of this._parser.saxDataEvents) {
      this.push(event)
    }
    callback();
  }

  _flush(callback) {
    // See comment in SAXParser.closeText
    this._parser.write(null)
    for(const event of this._parser.saxDataEvents) {
      this.push(event)
    }
    callback();
  }
}

