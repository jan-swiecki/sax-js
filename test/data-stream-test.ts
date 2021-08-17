import { PassThrough, Writable } from "stream"
import tap = require("tap")
import { SAXDataEvent, SAXStream } from "../lib/SAXStream"


let saxStream = new SAXStream()

saxStream.emitAllNodeTypes()

tap.plan(2)
saxStream.on('data', (data: SAXDataEvent) => {
  if(data.nodeType === 'text') {
    tap.equal(data.data, 'text')
  }
})
saxStream.on('text', data => {
  tap.equal(data, 'text')
})

saxStream.write('<div>text</div>')
saxStream.end()