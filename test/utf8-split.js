const tap = require('tap')
const { SAXStream } = require('../lib/SAXStream')

var saxStream = new SAXStream()
saxStream.emitAllNodeTypes()

var b = Buffer.from('误')

tap.plan(6)

saxStream.on('ontext', function (text) {
  tap.equal(text, b.toString())
})

saxStream.write(Buffer.from('<test><a>'))
saxStream.write(b.slice(0, 1))
saxStream.write(b.slice(1))
saxStream.write(Buffer.from('</a><b>'))
saxStream.write(b.slice(0, 2))
saxStream.write(b.slice(2))
saxStream.write(Buffer.from('</b><c>'))
saxStream.write(b)
saxStream.write(Buffer.from('</c>'))
saxStream.write(Buffer.concat([Buffer.from('<d>'), b.slice(0, 1)]))
saxStream.end(Buffer.concat([b.slice(1), Buffer.from('</d></test>')]))

var saxStream2 = new SAXStream()
saxStream2.emitAllNodeTypes()

saxStream2.on('ontext', function (text) {
  tap.equal(text, '�')
})

saxStream2.write(Buffer.from('<root>'))
saxStream2.write(Buffer.from('<e>'))
saxStream2.write(Buffer.from([0xC0]))
saxStream2.write(Buffer.from('</e>'))
saxStream2.write(Buffer.concat([Buffer.from('<f>'), b.slice(0, 1)]))
saxStream2.write(Buffer.from('</f></root>'))
saxStream2.end()
