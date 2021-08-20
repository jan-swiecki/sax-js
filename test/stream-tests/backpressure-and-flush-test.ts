import fs = require('fs');


import _ = require('lodash');
import tap = require('tap');
import through2 = require('through2');


import { formatBytes } from '../../lib/SpeedFormatters';
import { Depth, randomXmlStream } from '../../lib/randomXmlStream';
import { SAXDataEvent, SAXStream } from '../../lib/SAXStream';
import { ENodeTypes } from '../../lib/SAXParser';
import xmlBeautifier from '../../lib/xml-beautifier';


const kb = 1024;
const mb = 1024*1024;
const gb = 1024*1024*1024;


const test_cases: [number, number, number, boolean?][] = [
  [2, 16*kb, 512],
  [2, 35*kb, 512],
  [2, 64*kb, 512],
  [2, 128*kb, 512],
  [2, 128*kb, 16*kb],
  [2, mb, 32*kb],
  [3, mb, 32*kb],
  [4, mb, 32*kb]
]


async function run() {
  tap.plan(test_cases.length)
  for(const args of test_cases) {
    await check(...args)
  }
}


run()


function check(N: number, maxSize: number, highWaterMark: number, trailingRandomText: boolean = false) {
  return new Promise<void>((resolve, reject) => {

    const saxStream = new SAXStream(false)
    saxStream.emitAllNodeTypes()
  
    let inputXml = ''
    let intermediateXml = ''
    let outputXml = ''
  
    const devnull  = fs.createWriteStream('/dev/null')
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
          maxChildren: x == 2 ? Infinity : null,
          trailingRandomText: trailingRandomText ? 1000 : null
        }
      },
      trailingEndLine: false,
      highWatermark: highWaterMark
    })

  
    const check = () => {
      const t1 = xmlBeautifier(inputXml).length
      const t2 = xmlBeautifier(outputXml).length
      const diffPercent = Math.abs(t2-t1)/t2
      tap.ok(diffPercent == 0, `diffPercent == 0, t1=${t1} t2=${t2} diffPercent=${diffPercent.toFixed(3)}, N=${N}, xml stream size=${formatBytes(maxSize)}, highWaterMark=${formatBytes(highWaterMark)}, trailingRandomText=${trailingRandomText}`)
      resolve()
    }
  
    let stopped = false
  
    const debug = (name, stream) => {
      // stream.on('close', () => console.log(`${name} close`))
      // // stream.on('data', () => console.log(`${name} data`))
      // stream.on('end', () => console.log(`${name} end`))
      // stream.on('error', (err) => console.log(`${name} error:`, err))
      // stream.on('open', () => console.log(`${name} open`))
      // stream.on('pause', () => console.log(`${name} pause`))
      // // stream.on('readable', () => console.log(`${name} readable`))
      // stream.on('ready', () => console.log(`${name} ready`))
      // stream.on('resume', () => console.log(`${name} resume`))
      // stream.on('drain', () => console.log(`${name} drain`))
      // stream.on('finish', () => console.log(`${name} finish`))
      // stream.on('pipe', () => console.log(`${name} pipe`))
      // stream.on('unpipe', () => console.log(`${name} unpipe`))
      return stream
    }

    debug('infiniteXml', infiniteXml)
      .pipe(debug('pipe1', through2(function(chunk, encoding, callback) {
        inputXml += chunk

        if(c1.total > maxSize && !stopped) {
          stopped = true
          infiniteXml.finish()
        }

        c1.total += chunk.length
        this.push(chunk)
        callback()
      })))
      .pipe(debug('saxStream', saxStream))
      // .on('error', err => {
      //   throw err
      //   // ignore, because we cut input stream in half so saxStream will break
      // })
      .pipe(debug('to_string', through2.obj(function(node: SAXDataEvent, encoding, callback) {
        let x = '';
        switch(node.nodeType) {
          case ENodeTypes.opentag:      this.push(x = `<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join('')}${node.data.isSelfClosing ? '/' : ''}>`); break;
          case ENodeTypes.closetag:     this.push(x = `</${node.data}>`); break;
          case ENodeTypes.text:         this.push(x = node.data); break
          case ENodeTypes.cdata:        this.push(x = `<![CDATA[${node.data}]]>`); break
        }
        // intermediateXml += x
        callback()
      })))
      .pipe(debug('pipe_last', through2(function(chunk, encoding, callback) {
        outputXml += chunk
        c2.total += chunk.length
        this.push(chunk)
        callback()
      })))
      .on('end', () => {
        check()
      })
      .pipe(devnull);
  })
}