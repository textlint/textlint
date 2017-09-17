# TxtAST interface

TxtAST define AST(Abstract Syntax Tree) for processing in textlint.

## What is AST?

[Abstract syntax tree](http://en.wikipedia.org/wiki/Abstract_syntax_tree "Abstract syntax tree - Wikipedia, the free encyclopedia") is a tree representation of the abstract syntactic structure of text.

Each node of the tree has same interface, is called `TxtNode`.

[![ast-explorer fork](./resources/ast-explorer.png)](https://textlint.github.io/astexplorer/)

[AST explorer for textlint](https://textlint.github.io/astexplorer/ "AST explorer for textlint") is useful for understanding AST.

## [TxtAST](../typings/txtast.d.ts) interface

Please see TypeScript definition file: [typings/txtast.ts](../typings/txtast.ts)

### `TxtNode`

[`TxtNode`](../typings/txtast.ts) has these properties.

```typescript
interface TxtNode {
    type: string;
    raw: string;
    range: [number, number]
    loc: LineLocation;
    // parent is runtime information
    // Not need in AST
    parent?: TxtNode;
}
interface LineLocation {
    start: Position;
    end: Position;
}
interface Position {
    line: number; // start with 1
    column: number;// start with 0
    // This is for compatibility with JavaScript AST.
    // https://gist.github.com/azu/8866b2cb9b7a933e01fe
}
```

- `type`: type of Node
- `raw`: raw value of Node
    - if you want to get raw value, please use `getSource(<node>)` instead of it.
- `loc`: location object
- `range`: location info array like `[startIndex, endIndex]`
- `parent`: (optional) parent node of this node. it is attached in runtime.

### `TxtTextNode` 

`TxtInlineNode` is inherit the `TxtNode` abstract interface.

```typescript
interface TxtTextNode extends TxtNode {
    value: string
}
```

- `value`: the value of inline node.

### `TxtParentNode`
 
`TxtParentNode` is inherit the `TxtNode` abstract interface.

```typescript
interface TxtParentNode extends TxtNode {
    children: TxtNode[] | TxtTextNode[];
}
```

- `children`: child nodes of this node.

### `type`

`type` is TxtNode type.

All Types are defined in `@textlint/ast-node-types`.
You can use this `ASTNodeTypes` value via following way:

```js
import { ASTNodeTypes } from "@textlint/ast-node-types";
console.log(ASTNodeTypes.Str); // "Str"

```

See [packages/ast-node-types](../packages/ast-node-types) for more details.

These types are be available at all times:

```json
{
    "Document": "Document",
    "Paragraph": "Paragraph",
    "BlockQuote": "BlockQuote",
    "ListItem": "ListItem",
    "List": "List",
    "Header": "Header",
    "CodeBlock": "CodeBlock",
    "HtmlBlock": "HtmlBlock",
    "ReferenceDef": "ReferenceDef",
    "HorizontalRule": "HorizontalRule",
    "Comment": "Comment",
    "Str": "Str",
    "Break": "Break",
    "Emphasis": "Emphasis",
    "Strong": "Strong",
    "Html": "Html",
    "Link": "Link",
    "Image": "Image",
    "Code": "Code"
}
```

The type is based on HTML tag.

Following parsers are built-in.

| Package | Version | Description |
|---------|---------|-------------|
| [`markdown-to-ast`](../packages/markdown-to-ast) | [![npm](https://img.shields.io/npm/v/markdown-to-ast.svg?style=flat-square)](https://www.npmjs.com/package/markdown-to-ast) | markdown parser |
| [`txt-to-ast`](../packages/txt-to-ast) | [![npm](https://img.shields.io/npm/v/txt-to-ast.svg?style=flat-square)](https://www.npmjs.com/package/txt-to-ast) | plain text parser |

If you want to get other type, please file issue.

- [packages/ast-node-types](../packages/ast-node-types)

### Online Parsing Demo

[![ast-explorer fork](./resources/ast-explorer.png)](https://textlint.github.io/astexplorer/)

[AST explorer for textlint](https://textlint.github.io/astexplorer/ "AST explorer for textlint") is useful for understanding AST.

Minimum(recommended) rules is following code:

```js
/**
 * @param {RuleContext} context
 */
export default function(context) {
    const { Syntax } = context;
    // root object
    return {
        [Syntax.Document](node) {},
        [Syntax.Paragraph](node) {},
        [Syntax.Str](node) {}
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

`TxtNode` has **0-based columns**, but the result of linting named `TextLintMessage` has **1-based columns**.

In other word, textlint's rule handle `TxtNode`, but [formatter](./formatter.md "Formatter") handle `TextLintMessage`.

## Example

Input: `*text*`

Output: AST by [markdown-to-ast](https://github.com/textlint/markdown-to-ast "markdown-to-ast")

```json
{
    "type": "Document",
    "children": [
        {
            "type": "Paragraph",
            "children": [
                {
                    "type": "Emphasis",
                    "children": [
                        {
                            "type": "Str",
                            "value": "text",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 1
                                },
                                "end": {
                                    "line": 1,
                                    "column": 5
                                }
                            },
                            "range": [
                                1,
                                5
                            ],
                            "raw": "text"
                        }
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 6
                        }
                    },
                    "range": [
                        0,
                        6
                    ],
                    "raw": "*text*"
                }
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 6
                }
            },
            "range": [
                0,
                6
            ],
            "raw": "*text*"
        }
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 6
        }
    },
    "range": [
        0,
        6
    ],
    "raw": "*text*"
}
```

Illustration

```
          *   text   *
          |   |__|   |
          |   value  |
          |__________|
               raw
```

- Document is a `TxtParentNode` and type is Document
    - have `children`, but not have `value`
- Paragraph is a `TxtParentNode` and type is Paragraph
    - have `children`, but not have `value`
- *Emphasis* is a `TxtTextNode` and type is Emphasis
    - have `value`
- "text" is a `TxtTextNode` and type is Str
    - have `value`

## Unist

`TxtAST` have a minimum of compatibility for [unist: Universal Syntax Tree](https://github.com/wooorm/unist "wooorm/unist: Universal Syntax Tree").

We discuss about Unist in [Compliances tests for TxtNode #141](https://github.com/textlint/textlint/issues/141 "Compliances tests for TxtNode #141").

## for Processor plugin creator

You can use [textlint-ast-test](https://github.com/textlint/textlint-ast-test "textlint-ast-test") for testing your processor plugin's parser.

- [textlint/textlint-ast-test: Compliance tests for textlint's AST](https://github.com/textlint/textlint-ast-test "textlint/textlint-ast-test: Compliance tests for textlint&#39;s AST")

```js
import { test, isTextlintAST } from "textlint-ast-test";
// your implement
import yourParse from "your-parser";
// recommenced: test much pattern test
const AST = yourParse("This is text");

// Validate AST
test(AST); // if the AST is invalid, then throw Error

isTextlintAST(AST); // true or false

```
## Warning

Other properties is not assured.
