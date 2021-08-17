require(__dirname).test({
  expect: [
    ["opentagstart", { name: "R", attributes: {} }],
    ["opentag", { name: "R", attributes: {}, isSelfClosing: false }],
    ["opencdata", void 0],
    ["cdata", " this is character data \uF8FF "],
    ["closecdata", void 0],
    ["closetag", "R"]
  ]
}).write("<r><![CDATA[ this is ").write("character data \uF8FF ").write("]]></r>").close();
