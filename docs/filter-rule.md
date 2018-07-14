---
id: filter-rule
title: Creating Filter Rule
---

Filter rule is same writing convention with [linting/fixing rule](./rule.md), but has different context.

## Usage of filter rule

Add filter rule name to `filters` field.

```json
{
  "filters": {
    "comments": true
  }
}
```

See [configuring.md](./configuring.md) for details.

### Filter rule name

```json
{
  "filters": {
    "<name>": true
  }
}
```

The rule `<name>` can be accept following patterns:

- `textlint-filter-rule-<name>`
- `<name>`
- `@scope/textlint-filter-rule-<name>`
- `@scope/<name>`

## FilterRuleContext

`shouldIgnore()` is core API of `FilterRuleContext`.

- `shouldIgnore(range, { ruleId })` is a method that report reports ignoring `range`( is array like `[start, end]`).
    - `context.shouldIgnore(node.range);` filter all messages 
    - `context.shouldIgnore(node.range, { ruleId: "rule-id" });` filter messages that are reported `"rule-id"` rule. 
- `Syntax.*` is const values of [TxtNode type](./txtnode.md).
    - e.g.) `context.Syntax.Str`
    - [packages/@textlint/ast-node-types/src/index.ts](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-node-types/src/index.ts)
- `getSource(<node>)`  is a method gets the source code for the given node.
    - e.g.) `context.getSource(node); // => "text"`
- `getFilePath()` return file path that is linting target.
    - e.g.) `context.getFilePath(): // => /path/to/file.md or undefined` 


## Example

Filter all `BlockQuote` node.

```js
module.exports = function(context) {
    const exports = {};
    exports[context.Syntax.BlockQuote] = function(node) {
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
module.exports = function(context) {
    const exports = {};
    exports[context.Syntax.Str] = function(node) {
        context.shouldIgnore(node.range, {
            ruleId: "no-todo"
        });
    };
    return exports;
};
```

## Package name convention

textlint's filter rule should use `textlint-filter-rule-` prefix.

For example, filtering by comment rule is `textlint-filter-rule-comments`.

textlint user use it by setting following:

```json
{
    "filters": {
        "comments": true
    }
}
```

### Example rules:

- [textlint-filter-rule-comments](https://github.com/textlint/textlint-filter-rule-comments "textlint-filter-rule-comments")
