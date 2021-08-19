import tap = require('tap')
import fs = require('fs')
import through2 = require('through2')
import { Transform, TransformCallback } from 'stream';
import { getSpeedCounter, getSpeedMeter } from '../lib/SpeedCounter';

const input = fs.createReadStream('/dev/zero', {
  // highWaterMark: 1024
})

const devnull = fs.createWriteStream('/dev/null')


const speedCounter = getSpeedCounter('/dev/urandom', {
  ticksBufferSize: 10000,
  type: 'bytes'
})


const speedMeter = getSpeedMeter()

speedMeter.start()

speedMeter.addCounter(speedCounter)

input.pipe(through2(function(chunk, encoding, callback) {
  speedCounter.tick(chunk.length)
  callback()

  // setTimeout(() => {
  //   callback()
  // }, 100)
})).pipe(devnull)




// let i = 10;

// class SlowTransform extends Transform {
//   override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {

//   }
// }

// function callback(chunk) {
//   console.log(chunk.length, chunk+'')
//   if(i-- <= 0) {
//     input.off('data', callback)
//     input.destroy()
//   }
// }

// input.on('data', callback)
