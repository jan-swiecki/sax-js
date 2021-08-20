import { Depth, randomXmlStream } from './randomXmlStream';


const randomXml = randomXmlStream({
  depthGenerator: function(n: number): Depth {
    const x = n+1
    // const y = x === 1 ? 1 : 3-Math.log(x)
    const y = x

    if(y < 1) {
      return;
    }

    // return {
    //   maxAttributes: y,
    //   maxAttributeKeySize: 10*y,
    //   maxAttributeValueSize: 20*y,
    //   maxTextSize: 50*y,
    //   maxCDataSize: 0,
    //   // maxChildren: y
    //   // maxChildren: x == 2 ? Infinity : y
    //   maxChildren: Infinity
    // }
    return {
      maxAttributes: 1,
      maxAttributeKeySize: 1,
      maxAttributeValueSize: 1,
      maxTextSize: 1,
      maxCDataSize: 0,
      // maxChildren: y
      // maxChildren: x == 2 ? Infinity : y
      maxChildren: Infinity
    }
  },
  format: true
})

randomXml.pipe(process.stdout)

setTimeout(() => {
  randomXml.finish()
}, 10)