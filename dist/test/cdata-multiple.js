require(__dirname).test({
  expect: [
    ["opentagstart", { name: "R", attributes: {} }],
    ["opentag", { name: "R", attributes: {}, isSelfClosing: false }],
    ["opencdata", void 0],
    ["cdata", " this is "],
    ["closecdata", void 0],
    ["opencdata", void 0],
    ["cdata", "character data \uF8FF "],
    ["closecdata", void 0],
    ["closetag", "R"]
  ]
}).write("<r><![CDATA[ this is ]]>").write("<![CDA").write("T").write("A[").write("character data \uF8FF ").write("]]></r>").close();
