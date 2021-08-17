const tap = require('tap')
const { SAXStream } = require('../lib/SAXStream')

var saxStream = new SAXStream()
tap.doesNotThrow(function () {
  saxStream.end()
})
