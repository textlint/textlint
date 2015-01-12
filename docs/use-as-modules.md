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

## Testing

You can use `textlint` module to test your `textlint` custom rules.

- [create-rules.md](./create-rules.md)

Consult link: [spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule](https://github.com/azu/spellcheck-tech-word-textlint-rule/blob/master/test/test.js "spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule")