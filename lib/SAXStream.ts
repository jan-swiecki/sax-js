import { Duplex } from "stream"


import { NodeTypes, SAXParser, NodeType } from './SAXParser.js';


export type SAXData = {
  nodeType: NodeType,
  data?: any
}


export class SAXStream extends Duplex {
  private _parser: SAXParser

  constructor(strict: boolean, opt) {
    super()
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

  on(event: string | symbol | NodeType, listener: (...args: any[]) => void) {
    if(NodeTypes.includes(event as NodeType)) {
      this._parser.on(event, (data) => {
        this.emit('data', {
          nodeType: event,
          data: data
        })
      })
    } else {
      super.on(event, listener)
    }

    return this;
  }

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

