const { SAXParser } = require('../lib/SAXParser')

var parser = new SAXParser(true)
var t = require('tap')
t.plan(1)
parser.on('onopentag', function (node) {
  t.same(node, { name: 'x', attributes: {}, isSelfClosing: false })
})
var xml = Buffer.from('<x>y</x>')
parser.write(xml).close()
