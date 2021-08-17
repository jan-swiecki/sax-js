const p = require(__dirname).test({
  expect: [
    ["opentagstart", { name: "R", attributes: {} }],
    ["opentag", { name: "R", attributes: {}, isSelfClosing: false }],
    ["opencdata", void 0],
    ["cdata", "[[[[[[[[]]]]]]]]"],
    ["closecdata", void 0],
    ["closetag", "R"]
  ]
});
let x = "<r><![CDATA[[[[[[[[[]]]]]]]]]]></r>";
for (let i = 0; i < x.length; i++) {
  p.write(x.charAt(i));
}
p.close();
const p2 = require(__dirname).test({
  expect: [
    ["opentagstart", { name: "R", attributes: {} }],
    ["opentag", { name: "R", attributes: {}, isSelfClosing: false }],
    ["opencdata", void 0],
    ["cdata", "[[[[[[[[]]]]]]]]"],
    ["closecdata", void 0],
    ["closetag", "R"]
  ]
});
x = "<r><![CDATA[[[[[[[[[]]]]]]]]]]></r>";
p2.write(x).close();
