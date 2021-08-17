require(__dirname).test({
  xml: "\uFEFF<P></P>",
  expect: [
    ["opentagstart", { name: "P", attributes: {} }],
    ["opentag", { name: "P", attributes: {}, isSelfClosing: false }],
    ["closetag", "P"]
  ]
});
require(__dirname).test({
  xml: '\uFEFF<P BOM="\uFEFF">\uFEFFStarts and ends with BOM\uFEFF</P>',
  expect: [
    ["opentagstart", { name: "P", attributes: {} }],
    ["attribute", { name: "BOM", value: "\uFEFF" }],
    ["opentag", { name: "P", attributes: { BOM: "\uFEFF" }, isSelfClosing: false }],
    ["text", "\uFEFFStarts and ends with BOM\uFEFF"],
    ["closetag", "P"]
  ]
});
require(__dirname).test({
  xml: " \uFEFF<P></P>",
  expect: [
    ["error", "Non-whitespace before first tag.\nLine: 0\nColumn: 2\nChar: \uFEFF"],
    ["text", "\uFEFF"],
    ["opentagstart", { name: "P", attributes: {} }],
    ["opentag", { name: "P", attributes: {}, isSelfClosing: false }],
    ["closetag", "P"]
  ],
  strict: true
});
require(__dirname).test({
  xml: "\uFEFF\uFEFF<P></P>",
  expect: [
    ["error", "Non-whitespace before first tag.\nLine: 0\nColumn: 2\nChar: \uFEFF"],
    ["text", "\uFEFF"],
    ["opentagstart", { name: "P", attributes: {} }],
    ["opentag", { name: "P", attributes: {}, isSelfClosing: false }],
    ["closetag", "P"]
  ],
  strict: true
});
