import fs = require('fs');


import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../lib/speed';
import { bytesEmojiFormatter } from '../lib/SpeedFormatters';
import { Transform, TransformCallback } from 'stream';


const devzero    = fs.createReadStream('/dev/zero')
const devnull    = fs.createWriteStream('/dev/null')
// const speedMeter = getSpeedMeter().start()
// const c1         = speedMeter.addCounter('/dev/null', bytesEmojiFormatter)
// const c2         = speedMeter.addCounter('second pipe', bytesEmojiFormatter)


class AmIAsyncOrNot extends Transform {
  private i: number;

  constructor() {
    super()
    this.i = 0;
  }

  override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    if(this.i++ > 100000) {
      console.log('end')
      this.end()
    } else {
      this.push('1')
      callback()
    }
  }
}


// tap.plan(1)

let i = 0
devzero
  // .pipe(new AmIAsyncOrNot())
  .pipe(through2(function(chunk, encoding, callback) {
    if(i++ > 100000) {
      console.log('end')
      this.end()
    } else {
      this.push('1')
      callback()
    }
  }))
  .pipe(devnull)

console.log('???')

setTimeout(() => {
  console.log('!!!')
}, 100)
  
// setTimeout(() => {
//   devzero.unpipe()
//   speedMeter.stop()

//   const t1 = c1.total
//   const t2 = c2.total
//   const diffPercent = Math.abs(t2-t1)/t2
//   tap.ok(diffPercent < 0.2, `diffPercent < 0.2, diffPercent=${diffPercent}`)
// }, 1000)