
require(__dirname).test({
  xml: '<Р>тест</Р>',
  strict: true,
  expect: [
    ['opentagstart', { name: 'Р', attributes: {} }],
    ['opentag', { name: 'Р', attributes: {}, isSelfClosing: false }],
    ['text', 'тест'],
    ['closetag', 'Р']
  ]
})
