require(__dirname).test({
  xml: "<r><![CDATA[ this is character data \uF8FF ]]></r>",
  expect: [
    ["opentagstart", { name: "R", attributes: {} }],
    ["opentag", { name: "R", attributes: {}, isSelfClosing: false }],
    ["opencdata", void 0],
    ["cdata", " this is character data \uF8FF "],
    ["closecdata", void 0],
    ["closetag", "R"]
  ]
});
