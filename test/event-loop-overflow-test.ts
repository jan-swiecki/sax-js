import fs = require('fs');


import _ = require('lodash');
import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../lib/speed';
import { bytesEmojiFormatter, formatBytes } from '../lib/SpeedFormatters';
import { Transform, TransformCallback, Writable } from 'stream';
import { Depth, randomXmlStream } from '../lib/randomXmlStream';
import { SAXDataEvent, SAXStream } from '../lib/SAXStream';
import { ENodeTypes } from '../lib/SAXParser';

const one_kb = 1024;
const one_mb = 1024*1024;
const ten_mb = 1024*1024*10;
const one_gb = 1024*1024*1024;

let i = 10;
let test_cases = [
  [2, 35*one_kb],
  [2, 100*one_kb],
  [2, one_mb],
]
tap.plan(test_cases.length+i)

const interval = setInterval(() => {
  console.log('tap ok')
  tap.ok(true, `${i} test`)
  i--
  if(i === 0) {
    clearInterval(interval)
  }
}, 100)


for(const [N, size] of test_cases) {
  check(N, size)
}


function check(N: number, maxSize: number) {
  const saxStream = new SAXStream(true)
  saxStream.emitAllNodeTypes()

  let inputXml = ''
  let outputXml = ''
  let size = 0

  // const devnull    = fs.createWriteStream('/dev/null')
  const devnull    = new Writable({
    write(chunk, encoding, callback) {
      // do nothing
      callback()
    }
  });
  
  const infiniteXml = randomXmlStream({
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
        maxChildren: x == 2 ? Infinity : null
      }
    },
    trailingEndLine: false
  })


  const stopAndCheck = () => {
    console.log('stop and check')
    infiniteXml.unpipe()
    infiniteXml.destroy()
    tap.ok(true, `finished! N=${N}, xml stream size=${formatBytes(maxSize)}`)
  }

  let stopped = false

  let c1 = 0
  let c2 = 0

  infiniteXml
    .pipe(through2(function(chunk, encoding, callback) {
      // console.log('c1 chunk', chunk.length)
      c1 += chunk.length
      // if(stopped) {
      //   return
      // }

      this.push(chunk)
      callback()
    }))
    .pipe(saxStream)
    .pipe(through2.obj(function(node: SAXDataEvent, encoding, callback) {
      switch(node.nodeType) {
        case ENodeTypes.opentag:      this.push(`<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join('')}${node.data.isSelfClosing ? '/' : ''}>`); break;
        case ENodeTypes.closetag:     this.push(`</${node.data}>`); break;
        case ENodeTypes.text:         this.push(node.data); break
        case ENodeTypes.cdata:        this.push(`<![CDATA[${node.data}]]>`); break
      }
      callback()
    }))
    .pipe(through2(function(chunk, encoding, callback) {
      // console.log('c2 chunk', chunk.length)
      if(stopped) {
        callback()
        return;
      }
      c2 += chunk.length

      if(c1 > maxSize) {
        stopped = true
        stopAndCheck()
      } else {
        this.push(chunk)
      }
      callback()
    }))
    .pipe(devnull);
}