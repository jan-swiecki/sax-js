import fs = require('fs');


import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../lib/speed';
import { bytesEmojiFormatter } from '../lib/SpeedFormatters';
import { Transform, TransformCallback } from 'stream';
import { Depth, randomXmlStream } from '../lib/randomXmlStream';
import { SAXStream } from '../lib/SAXStream';


function check(N: number) {
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
    trailingEndLine: false
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

// const devzero    = fs.createReadStream('/dev/zero')
// const devnull    = fs.createWriteStream('/dev/null')
// const speedMeter = getSpeedMeter().start()
// const c1         = speedMeter.addCounter('/dev/null', bytesEmojiFormatter)
// const c2         = speedMeter.addCounter('second pipe', bytesEmojiFormatter)


// class SlowTransform extends Transform {
//   private i: number;

//   constructor() {
//     super()
//     this.i = 0;
//   }

//   override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
//     // simulate some kind of resources overflow problem
//     setTimeout(() => {
//       callback()
//       this.push('1'.repeat(chunk.length))
//     }, (this.i++)*10)
//   }
// }


// tap.plan(1)


// devzero
//   .pipe(through2(function(chunk, encoding, callback) {
//     c1.tick(chunk.length)
//     this.push(chunk)
//     callback()
//   }))
//   .pipe(new SlowTransform())
//   .pipe(through2(function(chunk, encoding, callback) {
//     c2.tick(chunk.length)
//     callback()
//   }))
//   .pipe(devnull)

  
// setTimeout(() => {
//   devzero.unpipe()
//   speedMeter.stop()

//   const t1 = c1.total
//   const t2 = c2.total
//   const diffPercent = Math.abs(t2-t1)/t2
//   tap.ok(diffPercent < 0.2, `diffPercent < 0.2, diffPercent=${diffPercent}`)
// }, 1000)