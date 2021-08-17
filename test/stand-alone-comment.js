// https://github.com/isaacs/sax-js/issues/124
import index from "./index.js";

index.test({
  xml: '<!-- stand alone comment -->',
  expect: [
    [
      'comment',
      ' stand alone comment '
    ]
  ],
  strict: true,
  opt: {}
})
