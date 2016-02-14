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

- Types of plain-text are defined in [textlint/txt-to-ast](https://github.com/textlint/txt-to-ast "textlint/txt-to-ast")
    - [markdown-to-ast: online parsing demo](http://azu.github.io/markdown-to-ast/example/ "markdown-to-ast: online parsing demo")
- Types of Markdown text are defined in [textlint/markdown-to-ast](https://github.com/textlint/markdown-to-ast/ "textlint/markdown-to-ast")
    - [txt-to-ast: online parsing demo](http://azu.github.io/txt-to-ast/example/ "txt-to-ast: online parsing demo")

All Types are defined in [lib/parser/union-syntax.js](../lib/parser/union-syntax.js)

These types are be available at all times:

- Document
- Paragraph
- Str

TODO: if you want to get other type, please file issue.

### Online Parsing Demo

- Markdown AST
    - [markdown-to-ast: online parsing demo](http://azu.github.io/markdown-to-ast/example/ "markdown-to-ast: online parsing demo")
- Plain text AST (compatible Markdown AST)
    - [txt-to-ast: online parsing demo](http://azu.github.io/txt-to-ast/example/ "txt-to-ast: online parsing demo")

Minimum(recommended) rules is following code:

```js
/**
 * @param {RuleContext} context
 */
export default function (context) {
    const {Syntax} = context;
    // root object
    return {
        [Syntax.Document](node) {
        },
        [Syntax.Paragraph](node) {
        },
        [Syntax.Str](node) {
        },
        [Syntax.Break](node) {
        }
    };
}
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

- `line` of location start with 1 (1-indexed).
- `column` of location start with 0 (**0-indexed**).

This is for compatibility with JavaScript AST.

- [Why do `line` of location in JavaScript AST(ESTree) start with 1 and not 0?](https://gist.github.com/azu/8866b2cb9b7a933e01fe "Why do `line` of location in JavaScript AST(ESTree) start with 1 and not 0?")

**Important Note:**

> Text -> AST TxtNode(**0-based columns** here) -> textlint -> TextLintMessage(1-based columns)

`TxtNode` has **0-based columns**, but The result of linting which named `TextLintMessage` has **1-based columns**.

This means that textlint's rule handle `TxtNode`( **0-based columns** ), but the result of textlint's API output `TextLintMessage`( **1-based columns** ).

## Warning

Other properties is not assured.
