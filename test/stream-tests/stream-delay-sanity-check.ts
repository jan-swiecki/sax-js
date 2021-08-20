import fs = require('fs');


import _ = require('lodash');
import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../../lib/speed';
import { bytesEmojiFormatter, formatBytes } from '../../lib/SpeedFormatters';
import { Readable, Transform, TransformCallback } from 'stream';
import { Depth, randomXmlStream } from '../../lib/randomXmlStream';
import { SAXDataEvent, SAXStream } from '../../lib/SAXStream';
import { ENodeTypes } from '../../lib/SAXParser';

const kb = 1024;
const mb = 1024*1024;
const gb = 1024*1024*1024;

const test_cases: [number, number, number][] = [
  [2, 16*kb, 512],
  // [2, 35*kb, 512],
  // [2, 64*kb, 512],
  // [2, 128*kb, 512],
  // [2, 128*kb, 16*kb],
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
    let inputXml = ''
    let intermediateXml = ''
    let outputXml = ''
    let size = 0
  
    const devzero    = fs.createReadStream('/dev/zero', {highWaterMark: highWaterMark})
    // const devzero    = fs.createReadStream('./package.json', {highWaterMark: highWaterMark})
    const devnull    = fs.createWriteStream('/dev/null')
    let c1         = {total: 0}
    let c2         = {total: 0}
    
    const check = () => {
      console.log('stop and check')
      const t1 = c1.total
      const t2 = c2.total
      const diffPercent = Math.abs(t2-t1)/t2
      tap.ok(diffPercent < 0.05, `diffPercent < 0.05, t1=${t1} t2=${t2} diffPercent=${diffPercent.toFixed(3)}, N=${N}, xml stream size=${formatBytes(maxSize)}, highWaterMark=${formatBytes(highWaterMark)}`)
      resolve()
    }

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

    let wait = []
  
    let stopped = false
    debug('devzero', devzero)
      .pipe(debug('pipe1', new Transform({transform(chunk, encoding, callback) {
        process.stdout.write('.')
        inputXml += chunk

        if(stopped) {
          callback()
        }

        if(c1.total > maxSize && !stopped) {
          stopped = true
          // devzero.unshift(null)
          devzero.destroy()
          this.push(null)
          callback()
          // this.end()
          // devzero.unpipe()
          // callback()
          return
        }

        c1.total += chunk.length
        this.push(chunk)
        callback()
      }})))
      // .pipe(through2(function(chunk, encoding, callback) {
      //   intermediateXml += chunk
      //   this.push(chunk)
      //   callback()
      // }))
      .pipe(new Transform({
        transform(chunk, encoding, callback) {
          const x = t;
          wait.push(1)
          setTimeout(() => {
            this.push(chunk)
            wait[x] = 0
          }, 10*(t++))
          callback()
        },

        async flush(callback) {
          while(_.sum(wait) > 0) {
            await new Promise(r => setTimeout(r, 0))
          }

          console.log('flushed')
          callback()
        }
      }))
      .pipe(debug('pipe2', through2(function(chunk, encoding, callback) {
        process.stdout.write(',')
        outputXml += chunk
        c2.total += chunk.length
        this.push(chunk)
        callback()
      })))
      .on('end', () => {
        fs.writeFileSync('inputXml.xml', inputXml, 'utf8')
        fs.writeFileSync('intermediateXml.xml', intermediateXml, 'utf8')
        fs.writeFileSync('outputXml.xml', outputXml, 'utf8')
        check()
      })
      .pipe(debug('devnull', devnull))
  })
}