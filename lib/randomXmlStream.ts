import _ = require("lodash");


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


type Options = {
  maxAttributes: number[],
  maxAttributeKeySize: number[],
  maxAttributeValueSize: number[],
  maxTextSize: number[],
  maxCDataSize: number[],
  maxChildren: number[]
}


function * openTag(t: string, randomAttrs = false, options: Options = null, indent = '', depth = 0): IterableIterator<string> {
  yield `${indent}<${t}`;

  if(randomAttrs) {
    let a: IteratorResult<string, string>
    
    let attrs = randomAttributesString(
      options.maxAttributes[depth] || 0,
      options.maxAttributeKeySize[depth] || 0,
      options.maxAttributeValueSize[depth] || 0
    )
    while(a = attrs.next()) {
      if(a.done) {
        break
      }
      yield ' '
      yield a.value
    }
  }

  yield '>\n'

  const text = randomString(ceil(options.maxTextSize[depth]*random()))
  for(let x = 0; x < text.length; x += 120) {
    yield `${indent}  ${text.substring(x, x+120)}\n`;
  }

  const cdata = randomString(ceil(options.maxCDataSize[depth]*random()))
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


const closeTag = (t: string) => `</${t}>\n`


function * randomAttributesString(maxAttributes, maxAttributeKeySize, maxAttributeValueSize): IterableIterator<string> {
  let max = ceil(maxAttributes*random())
  while(max--) {
    const key = randomString(ceil(maxAttributeKeySize*random()))
    const value = randomString(ceil(maxAttributeValueSize*random()))
    yield `${key}="${value}"`
  }
}


export function randomXmlStream(stream = process.stdout, options: Options) {
  for(const chunk of randomXml()) {
    stream.write(chunk)
  }

  function * randomXml(depth = 0): IterableIterator<string> {
    const indent = '  '.repeat(depth)
    let maxChildren = options.maxChildren[depth] || 0
    if(depth === 0) {
      const root = randomString();
      // stream.write(`<${root}>\n`);
      yield * openTag(root, true, options, indent, depth)
      yield * randomXml(depth+1)
      yield closeTag(root)
    } else if(maxChildren > 0) {
      while(maxChildren--) {
        const tag = randomString()
        yield * openTag(tag, true, options, indent, depth)
        yield * randomXml(depth+1)
        yield indent
        yield closeTag(tag)
      }
    }
  }
}