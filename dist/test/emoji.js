require(__dirname).test({
  xml: "<a>&#x1f525;</a>",
  expect: [
    ["opentagstart", { name: "A", attributes: {} }],
    ["opentag", { name: "A", attributes: {}, isSelfClosing: false }],
    ["text", "\u{1F525}"],
    ["closetag", "A"]
  ],
  strict: false,
  opt: {}
});
