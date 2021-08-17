var { ENTITIES } = require('../lib/SAXParser')

var xml = '<r>'
var text = ''
for (var i in ENTITIES) {
  xml += '&' + i + ';'
  text += ENTITIES[i]
}
xml += '</r>'


require(__dirname).test({
  xml: xml,
  expect: [
    ['opentagstart', {'name': 'R', attributes: {}}],
    ['opentag', {'name': 'R', attributes: {}, isSelfClosing: false}],
    ['text', text],
    ['closetag', 'R']
  ]
})
