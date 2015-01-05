# TxtNode interface

Parse text to AST(Abstract Syntax Tree)

## What is AST?

[Abstract syntax tree](http://en.wikipedia.org/wiki/Abstract_syntax_tree "Abstract syntax tree - Wikipedia, the free encyclopedia") is a tree representation of the abstract syntactic structure of text.

Each node of the tree has same interface, is called `TxtNode`.

[![screenshot](http://monosnap.com/image/0fqi1UF7yOv89nxJPaDWtvyqERaM49.png)](http://azu.github.io/markdown-to-ast/example/)

## [TxtNode](./txtnode.d.ts) interface

[TxtNode](./txtnode.d.ts) has these properties.

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
    - [markdown-to-ast: online parsing demo](http://azu.github.io/markdown-to-ast/example/ "markdown-to-ast: online parsing demo")
- Types of Markdown text is defined in [azu/markdown-to-ast](https://github.com/azu/markdown-to-ast/ "azu/markdown-to-ast") (compatible Markdown AST)
    - [txt-to-ast: online parsing demo](http://azu.github.io/txt-to-ast/example/ "txt-to-ast: online parsing demo")

All Types is defined in [lib/parser/union-syntax.js](../lib/parser/union-syntax.js)

These types are be available at all times:

- Document
- Paragraph
- Break
- Str

### Online Parsing Demo

- Markdown AST
    - [markdown-to-ast: online parsing demo](http://azu.github.io/markdown-to-ast/example/ "markdown-to-ast: online parsing demo")
- Plain text AST
    - [txt-to-ast: online parsing demo](http://azu.github.io/txt-to-ast/example/ "txt-to-ast: online parsing demo")

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