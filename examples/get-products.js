// pull out /GeneralSearchResponse/categories/category/items/product tags
// the rest we don't care about.

let sax = require('../lib/sax.js')
let fs = require('fs')
let path = require('path')
let xmlFile = path.resolve(__dirname, 'shopping.xml')
let util = require('util')
let http = require('http')

fs.readFile(xmlFile, function (er, d) {
  http.createServer(function (req, res) {
    if (er) throw er
    let xmlstr = d.toString('utf8')

    let parser = sax.parser(true)
    let products = []
    let product = null
    let currentTag = null

    parser.onclosetag = function (tagName) {
      if (tagName === 'product') {
        products.push(product)
        currentTag = product = null
        return
      }
      if (currentTag && currentTag.parent) {
        let p = currentTag.parent
        delete currentTag.parent
        currentTag = p
      }
    }

    parser.onopentag = function (tag) {
      if (tag.name !== 'product' && !product) return
      if (tag.name === 'product') {
        product = tag
      }
      tag.parent = currentTag
      tag.children = []
      tag.parent && tag.parent.children.push(tag)
      currentTag = tag
    }

    parser.ontext = function (text) {
      if (currentTag) currentTag.children.push(text)
    }

    parser.onend = function () {
      let out = util.inspect(products, false, 3, true)
      res.writeHead(200, {'content-type': 'application/json'})
      res.end('{"ok":true}')
    // res.end(JSON.stringify(products))
    }

    parser.write(xmlstr).end()
  }).listen(1337)
})
