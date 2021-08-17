require(__dirname).test({
  xml: "<r>&rfloor; &spades; &copy; &rarr; &amp; &lt; < <  <   < &gt; &real; &weierp; &euro;</r>",
  expect: [
    ["opentagstart", { name: "R", attributes: {} }],
    ["opentag", { name: "R", attributes: {}, isSelfClosing: false }],
    ["text", "\u230B \u2660 \xA9 \u2192 & < < <  <   < > \u211C \u2118 \u20AC"],
    ["closetag", "R"]
  ]
});
