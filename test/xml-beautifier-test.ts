import tap = require('tap')
import xmlBeautifier from '../lib/xml-beautifier';


tap.equal(xmlBeautifier(`<root>1</root>`, 2), `<root>
  1
</root>`)

tap.equal(
  xmlBeautifier(`<root x="1"><child y="2">xyz</child><child y="3"><![CDATA[abc]]></child></root>`),
  `<root x="1">
  <child y="2">
    xyz
  </child>
  <child y="3">
    <![CDATA[abc]]>
  </child>
</root>`
)

/**
 * https://onlinerandomtools.com/generate-random-xml
 */
const randomXml = `<root>
  <anywhere>
    count
  </anywhere>
  <higher>
    1973812559
  </higher>
  <sunlight>
    <them>
      upper
    </them>
    <caught>
      <lose>
        alphabet
      </lose>
      <amount>
        numeral
      </amount>
      <refer>
        dream
      </refer>
      <lay>
        hunt
      </lay>
      <engine>
        stream
      </engine>
      <garage>
        everyone
      </garage>
    </caught>
    <smaller>
      spring
    </smaller>
    <waste>
      1209224147.3588629
    </waste>
    <develop>
      -213927044.4899645
    </develop>
    <require>
      -2130891977
    </require>
  </sunlight>
  <split>
    -269910315
  </split>
  <struggle>
    expect
  </struggle>
  <income>
    598441369
  </income>
</root>`

tap.equal(xmlBeautifier(randomXml), randomXml)