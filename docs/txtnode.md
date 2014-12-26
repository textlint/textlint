# TxtNode interface

Parse text to AST(TxtNodes)

## TxtNodes

- `type`: type of Node
- `raw`: text value of Node
- `loc`: location object

### `type`

`type` is TxtNode type.

- Types of plain-text is defined in [lib/parse/markdown/markdown-syntax.js](../lib/parse/markdown/markdown-syntax.js)
- Types of Markdown text is defined in [lib/parse/markdown-syntax.js](../lib/parse/markdown/markdown-syntax.js)

All Types is defined in [lib/parse/union-syntax.js](../lib/parse/union-syntax.js)

These types are be available at all times:

- Document
- Break
- Str

Minimum(recommended) rules is following code:

```js
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    // root object
    exports[context.Syntax.Document] = function (node) {
    };
    exports[context.Syntax.Str] = function (node) {
    };
    exports[context.Syntax.Break] = function (node) {
    };
    return exports;
};
```


### `loc`

`loc` is location info object.

```json
"loc": {
    "start": {
        "line": 2,
        "column": 4
    },
    "end": {
        "line": 2,
        "column": 10
    }
}
```

## Warning

Other properties is not assured.