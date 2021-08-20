import fs = require('fs');


import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../../lib/speed';
import { bytesEmojiFormatter } from '../../lib/SpeedFormatters';


const devzero    = fs.createReadStream('/dev/zero')
const devnull    = fs.createWriteStream('/dev/null')
// const speedMeter = getSpeedMeter().start()
// const c1         = speedMeter.addCounter('/dev/null', bytesEmojiFormatter)
// const c2         = speedMeter.addCounter('second pipe', bytesEmojiFormatter)
let c1 = 0
let c2 = 0

tap.plan(1)


devzero
  .pipe(through2(function(chunk, encoding, callback) {
    c1 += chunk.length
    this.push(chunk)
    callback()
  }))
  .pipe(through2(function(chunk, encoding, callback) {
    c2 += chunk.length
    this.push(chunk)
    callback()
  }))
  .pipe(devnull)


setTimeout(() => {
  devzero.unpipe()
  // speedMeter.stop()

  const t1 = c1
  const t2 = c2
  const diffPercent = Math.abs(t2-t1)/t2
  tap.ok(diffPercent < 0.01, `diffPercent < 0.01, diffPercent=${diffPercent}`)
}, 1000)
  