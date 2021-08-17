const tap = require('tap')
const { SAXStream } = require('../lib/SAXStream')

const saxStream = new SAXStream()
tap.doesNotThrow(function () {
  saxStream.end()
})
