require(__dirname).test({
  xml: "<xml><script>hello world<\/script></xml>",
  expect: [
    ["opentagstart", { name: "xml", attributes: {} }],
    ["opentag", { name: "xml", attributes: {}, isSelfClosing: false }],
    ["opentagstart", { name: "script", attributes: {} }],
    ["opentag", { name: "script", attributes: {}, isSelfClosing: false }],
    ["text", "hello world"],
    ["closetag", "script"],
    ["closetag", "xml"]
  ],
  strict: false,
  opt: { lowercasetags: true, noscript: true }
});
require(__dirname).test({
  xml: "<xml><script><![CDATA[hello world]]><\/script></xml>",
  expect: [
    ["opentagstart", { name: "xml", attributes: {} }],
    ["opentag", { name: "xml", attributes: {}, isSelfClosing: false }],
    ["opentagstart", { name: "script", attributes: {} }],
    ["opentag", { name: "script", attributes: {}, isSelfClosing: false }],
    ["opencdata", void 0],
    ["cdata", "hello world"],
    ["closecdata", void 0],
    ["closetag", "script"],
    ["closetag", "xml"]
  ],
  strict: false,
  opt: { lowercasetags: true, noscript: true }
});
