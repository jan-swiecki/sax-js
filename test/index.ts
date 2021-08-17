import { EventTypes, SAXParser, SAXStream  } from '../lib/sax.js';
import t from 'tap'

// handy way to do simple unit tests
// if the options contains an xml string, it'll be written and the parser closed.
// otherwise, it's assumed that the test will write and close.
export function test (options) {
  let xml = options.xml
  let parser = new SAXParser(options.strict, options.opt)
  let expect = options.expect
  let e = 0
  EventTypes.forEach(function (ev) {
    parser.on(ev, function (n) {
      if (process.env.DEBUG) {
        console.error({
          expect: expect[e],
          actual: [ev, n]
        })
      }
      if (e >= expect.length && (ev === 'end' || ev === 'ready')) {
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

      t.equal(ev.replace(/^on/, ''), expect[e][0])
      if (ev === 'error') {
        t.equal(n.message, expect[e][1])
      } else {
        t.same(n, expect[e][1])
      }
      e++
      if (ev === 'error') {
        parser.resume()
      }
    })
  })
  if (xml) {
    parser.write(xml).close()
  }
  return parser
}

if (module === require.main) {
  t.pass('common test file')
}