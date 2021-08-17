var p = import index from "./index.js";

index.test({
  expect: [
    ['opentagstart', {'name': 'R', 'attributes': {}}],
    ['opentag', {'name': 'R', 'attributes': {}, 'isSelfClosing': false}],
    ['opencdata', undefined],
    ['cdata', '[[[[[[[[]]]]]]]]'],
    ['closecdata', undefined],
    ['closetag', 'R']
  ]
})
var x = '<r><![CDATA[[[[[[[[[]]]]]]]]]]></r>'
for (var i = 0; i < x.length; i++) {
  p.write(x.charAt(i))
}
p.close()

var p2 = import index from "./index.js";

index.test({
  expect: [
    ['opentagstart', {'name': 'R', 'attributes': {}}],
    ['opentag', {'name': 'R', 'attributes': {}, 'isSelfClosing': false}],
    ['opencdata', undefined],
    ['cdata', '[[[[[[[[]]]]]]]]'],
    ['closecdata', undefined],
    ['closetag', 'R']
  ]
})
x = '<r><![CDATA[[[[[[[[[]]]]]]]]]]></r>'
p2.write(x).close()
