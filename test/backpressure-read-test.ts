import fs = require('fs');


import _ = require('lodash');
import tap = require('tap');
import through2 = require('through2');


import { formatBytes } from '../lib/SpeedFormatters';
import { Depth, randomXmlStream } from '../lib/randomXmlStream';
import { SAXDataEvent, SAXStream } from '../lib/SAXStream';
import { ENodeTypes } from '../lib/SAXParser';
import xmlBeautifier from '../lib/xml-beautifier';
import { Transform } from 'stream';


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
  [2, 10*mb, kb],
  [2, mb, 16*kb],
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

setTimeout(() => {}, 1000)


function check(N: number, maxSize: number, highWaterMark: number, trailingRandomText: boolean = false) {
  return new Promise<void>((resolve, reject) => {

    // const objHighWaterMark = 1024*1024*1024;
    const objHighWaterMark = 1024;

    const saxStream = new SAXStream(false, {
      highWaterMark: highWaterMark,
      objHighWaterMark: objHighWaterMark
    })
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
      highWatermark: highWaterMark,
      slow: true
    })

  
    const check = () => {
      const t1 = c1.total
      const t2 = c2.total
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

    let t = 0
    let i = 0

    debug('infiniteXml', infiniteXml)
      .pipe(debug('pipe1', new Transform({
        readableHighWaterMark: highWaterMark,
        writableHighWaterMark: highWaterMark,
        transform(chunk, encoding, callback) {
          if(c1.total > maxSize && !stopped) {
            stopped = true
            // console.log('finish')
            infiniteXml.finish()
          }

          c1.total += (chunk.toString().replace(/\n|\s/g, '')).length;
          // process.stdout.write('.'.repeat(chunk.length))
          // process.stdout.write('.')
          // console.log(`source xml --`.padStart(15), chunk.length)
          this.push(chunk)
          callback()
      }})))
      .pipe(debug('saxStream', saxStream))
      // .on('error', err => {
      //   throw err
      //   // ignore, because we cut input stream in half so saxStream will break
      // })
      .pipe(debug('x', new Transform({
        writableHighWaterMark: objHighWaterMark,
        readableHighWaterMark: highWaterMark,
        writableObjectMode: true,
        transform(node: SAXDataEvent, encoding, callback) {
          let x = '';
          switch(node.nodeType) {
            case ENodeTypes.opentag:      x = `<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join('')}${node.data.isSelfClosing ? '/' : ''}>`; break;
            case ENodeTypes.closetag:     x = `</${node.data}>`; break;
            case ENodeTypes.text:         x = node.data; break
            case ENodeTypes.cdata:        x = `<![CDATA[${node.data}]]>`; break
          }

          if(x !== '') {
            c2.total += (x.replace(/\n|\s/g, '')).length
            // process.stdout.write(','.repeat(x.length))
            // process.stdout.write(',')
            this.push(',')
            // console.log(`emit xml --`.padStart(15), x.length)
          }
          
          // intermediateXml += x
          callback()
      }})))
      // .pipe(debug('to_string', new Transform({
      //   writableHighWaterMark: objHighWaterMark,
      //   readableHighWaterMark: highWaterMark,
      //   writableObjectMode: true,
      //   transform(node: SAXDataEvent, encoding, callback) {
      //     let x = '';
      //     switch(node.nodeType) {
      //       case ENodeTypes.opentag:      this.push(x = `<${node.data.name}${_.map(node.data.attributes, (v, k) => ` ${k}="${v}"`).join('')}${node.data.isSelfClosing ? '/' : ''}>`); break;
      //       case ENodeTypes.closetag:     this.push(x = `</${node.data}>`); break;
      //       case ENodeTypes.text:         this.push(x = node.data); break
      //       case ENodeTypes.cdata:        this.push(x = `<![CDATA[${node.data}]]>`); break
      //     }

      //     if(x !== '') {
      //       process.stdout.write('-'.repeat(x.length))
      //       // console.log(`emit xml --`.padStart(15), x.length)
      //     }
          
      //     // intermediateXml += x
      //     callback()
      // }})))
      // .pipe(debug('pipe_last', new Transform({
      //   readableHighWaterMark: highWaterMark,
      //   writableHighWaterMark: highWaterMark,
      //   transform(chunk, encoding, callback) {
      //     i++
      //     setTimeout(() => {
      //       console.log(`last xml --`.padStart(15), chunk.length)
      //       // process.stdout.write(','.repeat(chunk.length))
      //       c2.total += (chunk.toString().replace(/\n/g, '')).length
      //       this.push(chunk)
      //       callback()
      //     },0)
      // }})))
      .on('end', () => {
        check()
      })
      .pipe(devnull);
  })
}