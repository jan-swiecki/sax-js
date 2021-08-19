import _ = require('lodash');
import tap = require('tap')


import { Depth, randomXmlStream } from '../lib/randomXmlStream';
import { SAXStream } from '../lib/SAXStream';


tap.resolves(check(0))
tap.resolves(check(0))
tap.resolves(check(0))
tap.resolves(check(0))
tap.resolves(check(0))
tap.resolves(check(0))
tap.resolves(check(0))
tap.rejects(check(1))
tap.rejects(check(0.8))
tap.rejects(check(0.6))
tap.rejects(check(0.4))
tap.rejects(check(0.2))


function check(garbageProbability: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const saxStream = new SAXStream(true)
    saxStream.emitAllNodeTypes()
    
    return randomXmlStream({
      depthGenerator: function(n: number): Depth {
        const x = n+1
        const y = n === 1 ? 1 : 3-Math.log(x)
  
        if(y < 1) {
          return;
        }
  
        return {
          maxAttributes: 1,
          maxAttributeKeySize: 1,
          maxAttributeValueSize: 1,
          maxTextSize: 1,
          maxCDataSize: 1,
          maxChildren: y
        }
      },
      trailingEndLine: false,
      garbageProbability: garbageProbability
    })
      .pipe(saxStream)
      .on('error', err => {
        reject(err)
      })
      .on('finish', () => {
        resolve()
      })
  })
}