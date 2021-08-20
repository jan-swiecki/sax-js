import fs = require('fs');


import _ = require('lodash');
import tap = require('tap');
import through2 = require('through2');


import { getSpeedMeter } from '../../lib/speed';
import { bytesEmojiFormatter, formatBytes } from '../../lib/SpeedFormatters';
import { Transform, TransformCallback, Writable } from 'stream';
import { Depth, randomXmlStream } from '../../lib/randomXmlStream';
import { SAXDataEvent, SAXStream } from '../../lib/SAXStream';
import { ENodeTypes } from '../../lib/SAXParser';

const one_kb = 1024;
const one_mb = 1024*1024;
const ten_mb = 1024*1024*10;
const one_gb = 1024*1024*1024;

function isPrime(num) {
  for ( var i = 2; i < num; i++ ) {
      if ( num % i === 0 ) {
          return false;
      }
  }
  return true;
}

function getPrime(n) {
  var arr = [2];
  for ( var i = 3; i < n; i+=2 ) {
      if ( isPrime(i) ) {
          arr.push(i);
      }
  }
  return arr[arr.length - 1]
}

const devzero    = fs.createReadStream('/dev/zero');
const devnull    = fs.createWriteStream('/dev/null');

let i = 0

const infiniteXml = randomXmlStream({
  depthGenerator: function(n: number): Depth {
    const x = n+1
    const y = n === 1 ? 1 : 2-Math.log(x)

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

const saxStream = new SAXStream()

infiniteXml
  // .pipe(through2(function(chunk, encoding, callback) {
  //   this.push(chunk)
  //   // process.stdout.write('.')
  //   callback()
  // }))
  .pipe(saxStream)
  // .pipe(through2(function(chunk, encoding, callback) {
  //   this.push(chunk)
  //   process.stdout.write('-')
  //   callback()
  // }))
  // .pipe(through2(function(chunk, encoding, callback) {
  //   this.push(chunk)
  //   // process.stdout.write(',')
  //   callback()
  // }))
  .pipe(devnull);
