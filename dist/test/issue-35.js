require(__dirname).test({
  xml: "<xml>&#Xd;&#X0d;\n</xml>",
  expect: [
    ["opentagstart", { name: "xml", attributes: {} }],
    ["opentag", { name: "xml", attributes: {}, isSelfClosing: false }],
    ["text", "\r\r\n"],
    ["closetag", "xml"]
  ],
  strict: true,
  opt: {}
});
