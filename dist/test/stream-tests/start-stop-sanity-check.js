var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const fs = require("fs");
const tap = require("tap");
const through2 = require("through2");
const devzero = fs.createReadStream("/dev/zero");
const devnull = fs.createWriteStream("/dev/null");
let c1 = 0;
let c2 = 0;
tap.plan(1);
let t1, t2;
devzero.pipe(t1 = through2(function(chunk, encoding, callback) {
  if (c1 > 128 * 1024 * 10) {
    devzero.unpipe();
    test();
  } else {
    c1 += chunk.length;
    this.push(chunk);
  }
  callback();
})).pipe(t2 = through2(function(chunk, encoding, callback) {
  c2 += chunk.length;
  this.push(chunk);
  callback();
})).pipe(devnull);
function test() {
  const diffPercent = Math.abs(c2 - c1) / c2;
  tap.ok(diffPercent < 0.01, `diffPercent < 0.01, diffPercent=${diffPercent}`);
}
__name(test, "test");
