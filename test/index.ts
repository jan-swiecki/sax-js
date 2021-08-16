import { EventTypes, SAXParser } from '../lib/SAXParser';
import { SAXStream } from '../lib/SAXStream';
import t from 'tap'

// handy way to do simple unit tests
// if the options contains an xml string, it'll be written and the parser closed.
// otherwise, it's assumed that the test will write and close.
export default function test (options) {
  var xml = options.xml
  var parser = new SAXParser(options.strict, options.opt)
  var expect = options.expect
  var e = 0
  EventTypes.forEach(function (ev) {
    parser[ev] = function (n) {
      if (process.env.DEBUG) {
        console.error({
          expect: expect[e],
          actual: [ev, n]
        })
      }
      if (e >= expect.length && (ev === 'onend' || ev === 'onready')) {
        return
      }
      t.ok(e < expect.length, 'no unexpected events')

      if (!expect[e]) {
        t.fail('did not expect this event', {
          event: ev,
          expect: expect,
          data: n
        })
        return
      }

      t.equal(ev, expect[e][0])
      if (ev === 'onerror') {
        t.equal(n.message, expect[e][1])
      } else {
        t.deepEqual(n, expect[e][1])
      }
      e++
      if (ev === 'onerror') {
        parser.resume()
      }
    }
  })
  if (xml) {
    parser.write(xml).close()
  }
  return parser
}

if (module === require.main) {
  t.pass('common test file')
}
