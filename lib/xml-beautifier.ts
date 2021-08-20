// https://github.com/svenheden/xml-beautifier/blob/e9c1af0d8a11cee11f071301713a24c37ce2aacb/src/index.js
// The MIT License (MIT)

// Copyright (c) 2015 Jonathan Svenheden

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Modified by Jan Święcki (c) 2021
// Licensed under MIT

import _ = require('lodash')


const splitOnTags = str => str.split(/(<\/?[^>]+>)/g).filter(line => line.trim() !== '');
const isTag = str => /<[^>!]+>/.test(str);
const isXMLDeclaration = str => /<\?[^?>]+\?>/.test(str);
const isClosingTag = str => /<\/+[^>]+>/.test(str);
const isSelfClosingTag = str => /<[^>]+\/>/.test(str);
const isOpeningTag = str => isTag(str) && !isClosingTag(str) && !isSelfClosingTag(str) && !isXMLDeclaration(str);


export default (xml: string, spaces: number = 2): string => {
  let depth = 0;
  const indent = spaces ? _.repeat(' ', spaces) : '  '

  return splitOnTags(xml).map(item => {
    // removes any pre-existing whitespace chars at the end or beginning of the item
    item = item.replace(/^\s+|\s+$/g, '');
    if (isClosingTag(item)) {
      depth--;
    }

    const line = _.repeat(indent, depth) + item;

    if (isOpeningTag(item)) {
      depth++;
    }

    return line;
  }).join('\n');
};