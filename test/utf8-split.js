const tap = require('tap')
const { SAXStream } = require('../lib/SAXStream')

const saxStream = new SAXStream()
saxStream.emitAllNodeTypes()

const b = Buffer.from('误')

tap.plan(6)

saxStream.on('data', function ({ nodeType, data }) {
  if (nodeType === 'text') {
    tap.equal(data, b.toString())
  }
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

const saxStream2 = new SAXStream()
saxStream2.emitAllNodeTypes()

saxStream2.on('data', function ({ nodeType, data }) {
  if (nodeType === 'text') {
    tap.equal(data, '�')
  }
})

saxStream2.write(Buffer.from('<root>'))
saxStream2.write(Buffer.from('<e>'))
saxStream2.write(Buffer.from([0xC0]))
saxStream2.write(Buffer.from('</e>'))
saxStream2.write(Buffer.concat([Buffer.from('<f>'), b.slice(0, 1)]))
saxStream2.write(Buffer.from('</root>'))
saxStream2.end()
