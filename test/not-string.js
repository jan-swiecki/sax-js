const { SAXParser } = require('../lib/SAXParser')

const parser = new SAXParser(true)
const t = require('tap')
t.plan(1)
parser.on('onopentag', function (node) {
  t.same(node, { name: 'x', attributes: {}, isSelfClosing: false })
})
const xml = Buffer.from('<x>y</x>')
parser.write(xml).close()
