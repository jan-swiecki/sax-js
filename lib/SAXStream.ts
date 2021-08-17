import { Duplex, Transform } from "stream"


import { NodeTypes, SAXParser, NodeType } from './SAXParser.js';


export type SAXDataEvent = {
  nodeType: NodeType,
  data?: any
}


export class SAXStream extends Transform {
  private _parser: SAXParser
  private buffer: SAXDataEvent[] = []

  constructor(strict: boolean = false, opt = {}) {
    super({
      readableObjectMode: true
    })
    this._parser = new SAXParser(strict, opt)

    this._parser.on('onend', () => {
      this.emit('end')
    })

    this._parser.on('onerror', er => {
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

  // on(event: string | symbol | NodeType, listener: (...args: any[]) => void) {
  //   if(NodeTypes.includes(event as NodeType)) {
  //     const nodeType = event as NodeType
  //     this.emitNodeTypes(nodeType)
  //     this.on('data', (data) => {
  //       this.buffer.push({
  //         nodeType: event,
  //         data: data
  //       })
  //     })
  //   } else {
  //     super.on(event, listener)
  //   }

  //   return this;
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
    // The underlying source only deals with strings.
    if (Buffer.isBuffer(chunk)) {
      chunk = chunk.toString();
    }
    this._parser.write(chunk)
    callback();
  }

  // SAXStream.prototype.end = function (chunk) {
  _final(callback) {
    this._parser.end()
    callback()
  }
}

