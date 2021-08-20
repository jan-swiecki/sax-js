import fs = require('fs');


import _ = require('lodash');
import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../lib/speed';
import { bytesEmojiFormatter, formatBytes } from '../lib/SpeedFormatters';
import { Readable, Transform, TransformCallback } from 'stream';
import { Depth, randomXmlStream } from '../lib/randomXmlStream';
import { SAXDataEvent, SAXStream } from '../lib/SAXStream';
import { ENodeTypes } from '../lib/SAXParser';

const kb = 1024;
const mb = 1024*1024;
const gb = 1024*1024*1024;

const test_cases: [number, number, number][] = [
  [2, 16*kb, 512],
  [2, 35*kb, 512],
  [2, 64*kb, 512],
  [2, 128*kb, 512],
  [2, 128*kb, 16*kb],
]

async function run() {
  tap.plan(test_cases.length)
  for(const args of test_cases) {
    await check(...args)
  }
}

run()

// check(2, mb, 10*kb)
// check(2, 128*kb, 512)
// check(2, 35*one_kb)




function check(N: number, maxSize: number, highWaterMark: number) {
  return new Promise<void>((resolve, reject) => {

    const saxStream = new SAXStream(true)
    saxStream.emitAllNodeTypes()
  
    let inputXml = ''
    let intermediateXml = ''
    let outputXml = ''
    let size = 0
  
    const devnull    = fs.createWriteStream('/dev/null')
    // const speedMeter = getSpeedMeter().start()
    // const c1         = speedMeter.addCounter('Random XML', bytesEmojiFormatter)
    // const c2         = speedMeter.addCounter('Output XML', bytesEmojiFormatter)
    let c1         = {total: 0}
    let c2         = {total: 0}
    
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
      trailingEndLine: false,
      highWatermark: highWaterMark
    })

  
    const check = () => {
      console.log('stop and check')
      // infiniteXml.stop()
      // infiniteXml.unpipe()
      // infiniteXml.unpipe()
      // infiniteXml.destroy()
      // speedMeter.stop()

      const t1 = c1.total
      const t2 = c2.total
      const diffPercent = Math.abs(t2-t1)/t2
      tap.ok(diffPercent < 0.05, `diffPercent < 0.05, t1=${t1} t2=${t2} diffPercent=${diffPercent.toFixed(3)}, N=${N}, xml stream size=${formatBytes(maxSize)}, highWaterMark=${formatBytes(highWaterMark)}`)
      resolve()
    }
  
    let stopped = false
  
    infiniteXml
      .pipe(through2(function(chunk, encoding, callback) {
        inputXml += chunk

        if(c1.total > maxSize && !stopped) {
          stopped = true
          infiniteXml.finish()
        }

        c1.total += chunk.length
        this.push(chunk)
        callback()
      }))
      .pipe(saxStream)
      // .on('error', err => {
      //   throw err
      //   // ignore, because we cut input stream in half so saxStream will break
      // })
      .pipe(through2.obj(function(node: SAXDataEvent, encoding, callback) {
        let x = '';
        switch(node.nodeType) {
          case ENodeTypes.opentag:      this.push(x = `<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join('')}${node.data.isSelfClosing ? '/' : ''}>`); break;
          case ENodeTypes.closetag:     this.push(x = `</${node.data}>`); break;
          case ENodeTypes.text:         this.push(x = node.data); break
          case ENodeTypes.cdata:        this.push(x = `<![CDATA[${node.data}]]>`); break
        }
        intermediateXml += x
        callback()
      }))
      .pipe(through2(function(chunk, encoding, callback) {
        outputXml += chunk
        c2.total += chunk.length
        this.push(chunk)
        callback()
      }))
      .on('finish', () => {
        fs.writeFileSync('inputXml.xml', inputXml, 'utf8')
        fs.writeFileSync('intermediateXml.xml', intermediateXml, 'utf8')
        fs.writeFileSync('outputXml.xml', outputXml, 'utf8')
        check()
      })
      .pipe(devnull);
  })
}