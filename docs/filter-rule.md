# Filter rule

Filter rule is same writing convention with [linting/fixing rule](./rule.md), but has different context.

## FilterRuleContext

`shouldIgnore()` is core API of `FilterRuleContext`.

- `shouldIgnore(range, { ruleId })` is a method that report reports ignoring `range`( is array like `[start, end]`).
    - `context.shouldIgnore(node.range);` filter all messages 
    - `context.shouldIgnore(node.range, { ruleId: "rule-id" });` filter messages that are reported `"rule-id"` rule. 
- `Syntax.*` is const values of [TxtNode type](./txtnode.md).
    - e.g.) `context.Syntax.Str`
    - [src/shared/type/NodeType.js](../src/shared/type/NodeType.js)
- `getSource(<node>)`  is a method gets the source code for the given node.
    - e.g.) `context.getSource(node); // => "text"`
- `getFilePath()` return file path that is linting target.
    - e.g.) `context.getFilePath(): // => /path/to/file.md or undefined` 


## Example

Filter all `BlockQuote` node.

```js
module.exports = function (context) {
    const exports = {};
    exports[context.Syntax.BlockQuote] = function (node) {
        context.shouldIgnore(node.range);
        /* === 
        context.shouldIgnore(node.range, {
             ruleId: "*"
        });
        */
    };
    return exports;
};
```

Filter messages which is reported by `no-todo` rule.

```js
module.exports = function (context) {
    const exports = {};
    exports[context.Syntax.Str] = function (node) {
        context.shouldIgnore(node.range, {
            ruleId: "no-todo"
        });
    };
    return exports;
};
```

## Package name convention

textlint's filter rule should use `textlint-filter-rule-` prefix.

e.g.) `textlint-filter-rule-comments`

textlint user use it following:

```js
{
    "filters": {
        "comments": true
    }
}
```

Examples:

- [textlint-filter-rule-comments](https://github.com/textlint/textlint-filter-rule-comments "textlint-filter-rule-comments")
