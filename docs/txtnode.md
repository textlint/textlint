# TxtNode interface

Parse text to AST(TxtNodes)

## [TxtNodes](./txtnode.d.ts)

[TxtNodes](./txtnode.d.ts) has these properties.

- `type`: type of Node
- `raw`: text value of Node
- `loc`: location object
- `range`: location info array like `[startIndex, endIndex]`

and for traversing.

- `children`: (optional) child nodes of this node.
- `parent`: (optional) parent node of this node.

### `type`

`type` is TxtNode type.

- Types of plain-text is defined in [azu/txt-to-ast](https://github.com/azu/txt-to-ast "azu/txt-to-ast")
- Types of Markdown text is defined in [azu/markdown-to-ast](https://github.com/azu/markdown-to-ast/ "azu/markdown-to-ast")

All Types is defined in [lib/parser/union-syntax.js](../lib/parser/union-syntax.js)

These types are be available at all times:

- Document
- Paragraph
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
    exports[context.Syntax.Paragraph] = function (node) {
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