# Use as node modules

`textlint` module expose these header at [index.js](../index.js)

```js
// Level of abstraction
// cli > TextLintEngine > textlint
module.exports = {
    // Command line interface
    cli: require("./lib/cli"),
    // TextLintEngine is a wrapper around `textlint` for linting multiple files
    TextLintEngine: require("./lib/textlint-engine"),
    // Core API for linting a single text.
    textlint: require("./lib/textlint")
};
```

Recommend to use `TextLintEngine`.

## Example

Lint a file:

See [example/node-module/lint-file.js](example/node-module/lint-file.js)

```js
var TextLintEngine = require("textlint").TextLintEngine;
var path = require("path");
function lintFile(filePath) {
    /**
     * TextLintConfig
     * See https://github.com/azu/textlint/blob/master/typing/textlint.d.ts
     */
    var options = {
        // load rules from [../rules]
        rulePaths: [path.join(__dirname, "..", "rules/")],
        formatterName: "pretty-error"
    };
    var engine = new TextLintEngine(options);
    var filePathList = [path.resolve(process.cwd(), filePath)];
    var results = engine.executeOnFiles(filePathList);
    /* 
    See https://github.com/azu/textlint/blob/master/typing/textlint.d.ts
    messages are TextLintMessage` array.
    [
        "filePath": "path/to/file",
        "messages" :[
            {
                id: "rule-name",
                message:"lint message",
                line: 1, // 1-based columns(TextLintMessage)
                column:1 // 1-based columns(TextLintMessage)
            }
        ]
    ]
     */
    var output = engine.formatResults(results);
    if (engine.isErrorResults(results)) {
        var output = engine.formatResults(results);
        console.log(output);
    }
}
```

## Testing

You can use [textlint-tester](https://github.com/azu/textlint-tester "textlint-tester") for testing your custom rule.

- [textlint-tester](https://github.com/azu/textlint-tester "textlint-tester")
- [create-rules.md](./create-rules.md)

Consult link: [spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule](https://github.com/azu/spellcheck-tech-word-textlint-rule/blob/master/test/test.js "spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule")