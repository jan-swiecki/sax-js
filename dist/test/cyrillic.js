require(__dirname).test({
  xml: "<\u0420>\u0442\u0435\u0441\u0442</\u0420>",
  expect: [
    ["opentagstart", { name: "\u0420", attributes: {} }],
    ["opentag", { name: "\u0420", attributes: {}, isSelfClosing: false }],
    ["text", "\u0442\u0435\u0441\u0442"],
    ["closetag", "\u0420"]
  ]
});
