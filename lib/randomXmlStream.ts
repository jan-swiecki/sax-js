import _ = require("lodash");
import { Readable, Writable } from "stream";


const { random, round, ceil } = Math


// https://stackoverflow.com/a/1349426/1637178
const alnum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const alphabetic = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';


function randomString(len: number = 10, chars = alnum, garbageProbability = 0, dontRepeatValues: Set<string> = null, retries = 3) {
  if(retries === 0) {
    throw new Error(`randomString: maximum retires reached, dontRepeatValue are getting repeated: ${[...dontRepeatValues.values()].join(', ')} (len=${len}, chars=${chars}, garbageProbability=${garbageProbability})`)
  }

  let result           = '';
  let charactersLength = chars.length;
  for(let i = 0; i < len; i++) {
    const c = Math.random() < garbageProbability ?
      String.fromCharCode(Math.floor(256*Math.random()))
      : chars.charAt(Math.floor(Math.random() * charactersLength));
    result += c
  }

  if(dontRepeatValues && dontRepeatValues.has(result)) {
    return randomString(len, chars, garbageProbability, dontRepeatValues, retries-1)
  } else {
    return result;
  }
}


export type Depth = {
  maxAttributes: number,
  maxAttributeKeySize: number,
  maxAttributeValueSize: number,
  maxTextSize: number,
  maxCDataSize: number,
  maxChildren: number,
}


type Options = {
  depthGenerator: (n: number) => Depth,
  trailingEndLine?: boolean,
  garbageProbability?: number
}


function gen(f: (n: number) => Depth) {
  return (function *g() {
    let n = 0;
    while(true) {
      const d = f(n++)
      if(! d) {
        break
      }
      yield d;
    }
  }())
}


function * openTag(t: string, d: Depth = null, indent = ''): IterableIterator<string> {
  yield `${indent}<${t}`;

  let a: IteratorResult<string, string>
    
  let attrs = randomAttributesString(
    d.maxAttributes || 0,
    d.maxAttributeKeySize || 0,
    d.maxAttributeValueSize || 0
  )

  while(a = attrs.next()) {
    if(a.done) {
      break
    }
    yield ' '
    yield a.value
    // const [key, value] = a.value
    // yield `${key}="${value}"`
  }

  yield '>\n'

  const text = randomString(ceil(d.maxTextSize*random()))
  for(let x = 0; x < text.length; x += 120) {
    yield `${indent}  ${text.substring(x, x+120)}\n`;
  }

  const cdata = randomString(ceil(d.maxCDataSize*random()))
  if(cdata.length > 0) {
    yield `${indent}  <![CDATA[`
    for(let x = 0; x < cdata.length; x += 120) {
      if(x > 0) {
        yield `${indent}  `
      }
      yield `${cdata.substring(x, x+120)}`;
      if(x+120 < cdata.length) {
        yield '\n'
      }
    }
    yield `]]>\n`
  }
}


function *closeTag(t: string){
  yield `</${t}>`
}


function * randomAttributesString(maxAttributes, maxAttributeKeySize, maxAttributeValueSize): IterableIterator<string> {
  let dontRepeatValues = new Set<string>()
  let max = ceil(maxAttributes*random())
  while(max--) {
    // dont repeat attribute names
    const key = randomString(ceil(maxAttributeKeySize*random()), alphabetic, 0, dontRepeatValues)
    dontRepeatValues.add(key)

    const value = randomString(ceil(maxAttributeValueSize*random()))

    yield `${key}="${value}"`
  }
}


export function randomXmlStream(options: Options): Readable {
  const depthGenerator = gen(options.depthGenerator)
  const depthResults: IteratorResult<Depth>[] = []

  const trailingEndLine = _.isUndefined(options.trailingEndLine) ? true : options.trailingEndLine
  const garbageProbability = _.isUndefined(options.garbageProbability) ? 0 : options.garbageProbability


  return Readable.from(function *() {
    for(const chunk of randomXml()) {
      yield chunk
    }
  }())


  function * randomXml(depth = 0): IterableIterator<string> {
    const indent        = '  '.repeat(depth)
    const depthRes      = depthResults[depth] || depthGenerator.next()
    depthResults[depth] = depthRes
    
    if(depthRes.done) {
      return
    }
    
    const d: Depth = depthRes.value

    // XML can have only one root
    let maxChildren = depth === 0 ? 1 : ceil(d.maxChildren * random())

    if(maxChildren >= 1) {
      while(maxChildren--) {
        const tag = randomString(10, alphabetic, garbageProbability)
        yield * openTag(tag, d, indent)
        yield * randomXml(depth+1)
        yield indent
        yield * closeTag(tag)
        if(trailingEndLine) {
          yield '\n'
        }
      }
    }
  }
}