var parser = import index from "./index.js";

index.test({
  expect: [
    ['opentagstart', {'name': 'T', attributes: {}}],
    ['opentag', {'name': 'T', attributes: {}, isSelfClosing: false}],
    ['text', 'flush'],
    ['text', 'rest'],
    ['closetag', 'T']
  ]
})

parser.write('<T>flush')
parser.flush()
parser.write('rest</T>')
parser.close()
