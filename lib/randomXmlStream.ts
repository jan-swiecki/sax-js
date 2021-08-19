import _ = require("lodash");
import { Readable, Writable } from "stream";


const { random, round, ceil } = Math


// https://stackoverflow.com/a/1349426/1637178
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';


function randomString(len: number = 10) {
  let result           = '';
  let charactersLength = characters.length;
  for(let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
  depthGenerator: (n: number) => Depth
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
  yield `</${t}>\n`
}


function * randomAttributesString(maxAttributes, maxAttributeKeySize, maxAttributeValueSize): IterableIterator<string> {
  let max = ceil(maxAttributes*random())
  while(max--) {
    const key = randomString(ceil(maxAttributeKeySize*random()))
    const value = randomString(ceil(maxAttributeValueSize*random()))
    yield `${key}="${value}"`
  }
}


export function randomXmlStream(options: Options): Readable {
  const depthGenerator = gen(options.depthGenerator)
  const depthResults: IteratorResult<Depth>[] = []


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
    let maxChildren = ceil(d.maxChildren * random())

    if(maxChildren >= 1) {
      while(maxChildren--) {
        const tag = randomString()
        yield * openTag(tag, d, indent)
        yield * randomXml(depth+1)
        yield indent
        yield * closeTag(tag)
      }
    }
  }
}