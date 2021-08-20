import _ = require('lodash');
import tap = require('tap')
import through2 = require('through2')


import { Depth, randomXmlStream } from '../../lib/randomXmlStream';
import { ENodeTypes } from '../../lib/SAXParser';
import { SAXDataEvent, SAXStream } from '../../lib/SAXStream';
import xmlBeautifier from '../../lib/xml-beautifier';


tap.plan(9*2)
check(3)
check(3)
check(3)
check(3, false)
check(3, false)
check(3, false)
check(4)
check(4)
check(4)
// check(4.2)
// check(4.2)
// check(4.2)


function check(N: number, format: boolean = true) {
  const saxStream = new SAXStream(true)
  saxStream.emitAllNodeTypes()

  let inputXml = ''
  let outputXml = ''
  let size = 0
  
  return randomXmlStream({
    depthGenerator: function(n: number): Depth {
      const x = n+1
      const y = n === 1 ? 1 : N-Math.log(x)

      if(y < 1) {
        return;
      }

      return {
        maxAttributes: y,
        maxAttributeKeySize: y,
        maxAttributeValueSize: y,
        maxTextSize: y,
        maxCDataSize: y,
        maxChildren: y
      }
    },
    trailingEndLine: false,
    format: format
  })
    .pipe(through2(function(chunk, encoding, callback) {
      size += chunk.length
      inputXml = inputXml + chunk
      this.push(chunk)
      callback()
    }))
    .pipe(saxStream)
    .pipe(through2.obj(function(node: SAXDataEvent, encoding, callback) {
      switch(node.nodeType) {
        case ENodeTypes.opentag:      outputXml += `<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join('')}${node.data.isSelfClosing ? '/' : ''}>`; break;
        case ENodeTypes.closetag:     outputXml += `</${node.data}>`; break;
        case ENodeTypes.text:         outputXml += node.data; break
        case ENodeTypes.cdata:        outputXml += `<![CDATA[${node.data}]]>`; break
      }
      callback()
    }))
    .on('finish', () => {
      tap.equal(
        outputXml.replace(/\n/g, ''),
        inputXml.replace(/\n/g, ''),
        `newline-stripped xmls equal (input size = ${(size/1024).toFixed(2)}kb)`
      )

      tap.equal(
        xmlBeautifier(outputXml),
        xmlBeautifier(inputXml),
        `xml-beautified xmls equal (input size = ${(size/1024).toFixed(2)}kb)`
      )
    })
}