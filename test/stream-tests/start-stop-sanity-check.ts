import fs = require('fs');


import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../../lib/speed';
import { bytesEmojiFormatter } from '../../lib/SpeedFormatters';


const devzero    = fs.createReadStream('/dev/zero')
const devnull    = fs.createWriteStream('/dev/null')

let c1 = 0
let c2 = 0


tap.plan(1)


let t1, t2

devzero
  .pipe(t1 = through2(function(chunk, encoding, callback) {
    if(c1 > 128*1024*10) {
      devzero.unpipe()
      test()
    } else {
      c1 += chunk.length
      this.push(chunk)
    }
    callback()
  }))
  .pipe(t2 = through2(function(chunk, encoding, callback) {
    c2 += chunk.length
    this.push(chunk)
    callback()
  }))
  .pipe(devnull)

const interval = setInterval(() => {
  console.log(t1.isPaused(), t2.isPaused())
}, 0)

function test () {
  clearInterval(interval)
  const diffPercent = Math.abs(c2-c1)/c2
  tap.ok(diffPercent < 0.01, `diffPercent < 0.01, diffPercent=${diffPercent}`)
}
