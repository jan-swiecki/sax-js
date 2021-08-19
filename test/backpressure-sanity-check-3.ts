import fs = require('fs');


import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../lib/speed';
import { bytesEmojiFormatter } from '../lib/SpeedFormatters';
import { Transform, TransformCallback } from 'stream';


const devzero    = fs.createReadStream('/dev/zero')
const devnull    = fs.createWriteStream('/dev/null')
const speedMeter = getSpeedMeter().start()
const c1         = speedMeter.addCounter('/dev/null', bytesEmojiFormatter)
const c2         = speedMeter.addCounter('second pipe', bytesEmojiFormatter)


class SlowTransform extends Transform {
  private i: number;

  constructor() {
    super()
    this.i = 0;
  }

  override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {
    // simulate some kind of resources overflow problem
    setTimeout(() => {
      callback()
      this.push('1'.repeat(chunk.length))
    }, (this.i++)*10)
  }
}


tap.plan(1)


devzero
  .pipe(through2(function(chunk, encoding, callback) {
    c1.tick(chunk.length)
    this.push(chunk)
    callback()
  }))
  .pipe(new SlowTransform())
  .pipe(through2(function(chunk, encoding, callback) {
    c2.tick(chunk.length)
    callback()
  }))
  .pipe(devnull)

  
setTimeout(() => {
  devzero.unpipe()
  speedMeter.stop()

  const t1 = c1.total
  const t2 = c2.total
  const diffPercent = Math.abs(t2-t1)/t2
  tap.ok(diffPercent < 0.2, `diffPercent < 0.2, diffPercent=${diffPercent}`)
}, 1000)