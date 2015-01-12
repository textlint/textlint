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

## Example

Lint a file:

See [example/node-module/lint-file.js](example/node-module/lint-file.js)

```js
"use strict";
var TextLintEngine = require("textlint").TextLintEngine;
var path = require("path");
function lintFile(filePath) {
    /**
     * @type {TextLintConfig}
     * See lib/_typing/textlint.d.ts
     */
    var options = {
        // load rules from [../rules]
        rulePaths: [path.join(__dirname, "..", "rules/")],
        formatName: "pretty-error"
    };
    var engine = new TextLintEngine(options);
    var filePathList = [path.resolve(process.cwd(), filePath)];
    var results = engine.executeOnFiles(filePathList);
    var output = engine.formatResults(results);
    if (engine.isErrorResults(results)) {
        var output = engine.formatResults(results);
        console.log(output);
    }
}
```


## Testing

You can use `textlint` module to test your `textlint` custom rules.

- [create-rules.md](./create-rules.md)

Consult link: [spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule](https://github.com/azu/spellcheck-tech-word-textlint-rule/blob/master/test/test.js "spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule")