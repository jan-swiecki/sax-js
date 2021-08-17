// unquoted attributes should be ok in non-strict mode
// https://github.com/isaacs/sax-js/issues/31
import index from "./index.js";

index.test({
  xml: '<span class=test hello=world></span>',
  expect: [
    [
      'opentagstart',
      {
        name: 'SPAN',
        attributes: {}
      }
    ],
    [
      'attribute',
      {
        name: 'CLASS',
        value: 'test'
      }
    ],
    [
      'attribute',
      {
        name: 'HELLO',
        value: 'world'
      }
    ],
    [
      'opentag',
      {
        name: 'SPAN',
        attributes: {
          CLASS: 'test',
          HELLO: 'world'
        },
        isSelfClosing: false
      }
    ],
    [
      'closetag',
      'SPAN'
    ]
  ],
  strict: false,
  opt: {}
})
