import _ = require('lodash');
import tap = require('tap')


import { Depth, randomXmlStream } from '../../lib/randomXmlStream';
import { SAXStream } from '../../lib/SAXStream';
import { Transform } from 'stream';


// tap.resolves(check(0), 'resolves 1')
// tap.resolves(check(0), 'resolves 2')
// tap.resolves(check(0), 'resolves 3')
// tap.resolves(check(0), 'resolves 4')
// tap.resolves(check(0), 'resolves 5')
// tap.resolves(check(0), 'resolves 6')
// tap.resolves(check(0), 'resolves 7')
tap.rejects(check(1), 'rejects 8')
// tap.rejects(check(0.8), 'rejects 9')
// tap.rejects(check(0.6), 'rejects 10')
// tap.rejects(check(0.4), 'rejects 11')
// tap.rejects(check(0.2), 'rejects 12')


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
      .pipe(new Transform({
        transform(chunk, encoding, callback) {
          process.stdout.write(`'''${chunk}''' `);
          this.push(chunk)
          callback()
        }
      }))
      .pipe(saxStream)
      .on('error', err => {
        reject(err)
      })
      .on('finish', () => {
        resolve()
      })
  })
}