# Formatter

Pass following object to reporter module .

```js
var results = [
    // TextLintResult object
    {
        filePath: "./myfile.js",
        messages: [
            {
                ruleId: "semi",
                line: 1,
                column: 23,
                message: "Expected a semicolon."
            }
        ]
    }
];
```

## How to get source code from result?

You can read the source code from `filePath` property or `raw` property of `Document` node.