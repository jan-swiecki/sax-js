import { Depth, randomXmlStream } from './randomXmlStream';


randomXmlStream({
  depthGenerator: function(n: number): Depth {
    const x = n+1
    const y = x === 1 ? 1 : 3-Math.log(x)

    if(y < 1) {
      return;
    }

    return {
      maxAttributes: y,
      maxAttributeKeySize: 10*y,
      maxAttributeValueSize: 20*y,
      maxTextSize: 50*y,
      maxCDataSize: 0,
      maxChildren: y
    }
  },
  format: true
}).pipe(process.stdout)