const { SAXParser } = require('../lib/SAXParser.js')

const tap = require('tap')

function testPosition (chunks, expectedEvents) {
  var parser = new SAXParser()
  expectedEvents.forEach(function (expectation) {
    parser.on(expectation[0], function () {
      for (var prop in expectation[1]) {
        tap.equal(parser[prop], expectation[1][prop])
      }
    })
  })
  chunks.forEach(function (chunk) {
    parser.write(chunk)
  })
}

testPosition(['<div>abcdefgh</div>'], [
  [ 'onopentagstart', { position: 5, startTagPosition: 1 } ],
  [ 'onopentag', { position: 5, startTagPosition: 1 } ],
  [ 'ontext', { position: 19, startTagPosition: 14 } ],
  [ 'onclosetag', { position: 19, startTagPosition: 14 } ]
])

testPosition(['<div>abcde', 'fgh</div>'], [
  ['onopentagstart', { position: 5, startTagPosition: 1 }],
  ['onopentag', { position: 5, startTagPosition: 1 }],
  ['ontext', { position: 19, startTagPosition: 14 }],
  ['onclosetag', { position: 19, startTagPosition: 14 }]
])
