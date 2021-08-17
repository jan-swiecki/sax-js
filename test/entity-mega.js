const { ENTITIES } = require('../lib/SAXParser')

let xml = '<r>'
let text = ''
for (const i in ENTITIES) {
  xml += '&' + i + ';'
  text += ENTITIES[i]
}
xml += '</r>'

require(__dirname).test({
  xml: xml,
  expect: [
    ['opentagstart', { name: 'R', attributes: {} }],
    ['opentag', { name: 'R', attributes: {}, isSelfClosing: false }],
    ['text', text],
    ['closetag', 'R']
  ]
})
