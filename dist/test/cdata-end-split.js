require(__dirname).test({
  expect: [
    ["opentagstart", { name: "R", attributes: {} }],
    ["opentag", { name: "R", attributes: {}, isSelfClosing: false }],
    ["opencdata", void 0],
    ["cdata", " this is "],
    ["closecdata", void 0],
    ["closetag", "R"]
  ]
}).write("<r><![CDATA[ this is ]").write("]>").write("</r>").close();
