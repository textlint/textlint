# Use as node modules

`textlint` module expose these header at [index.js](../index.js)

```js
// Level of abstraction
// cli > CLIEngine > textlint
module.exports = {
    cli: require("./lib/cli"),
    CLIEngine: require("./lib/cli-engine"),
    textlint: require("./lib/textlint")
};
```

## Testing

You can use `textlint` module to test your `textlint` custom rules.

- [create-rules.md](./create-rules.md)

Consult link: [spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule](https://github.com/azu/spellcheck-tech-word-textlint-rule/blob/master/test/test.js "spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule")