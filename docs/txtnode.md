---
id: txtnode
title: TxtAST Interface
---

TxtAST define AST(Abstract Syntax Tree) for processing in textlint.

## What is AST?

[Abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree "Abstract syntax tree - Wikipedia, the free encyclopedia") is a tree representation of the abstract syntactic structure of text.

Each node of the tree has same interface, is called `TxtNode`.

[![ast-explorer fork](assets/ast-explorer.png)](https://textlint.github.io/astexplorer/)

[AST explorer for textlint](https://textlint.github.io/astexplorer/ "AST explorer for textlint") is useful for understanding AST.

### `TxtNode`

`TxtNode` is a abstract node.

```typescript
/**
 * Basic TxtNode
 * Probably, Real TxtNode implementation has more properties.
 */
interface TxtNode {
    type: string;
    raw: string;
    range: TextNodeRange;
    loc: TxtNodeLineLocation;
    // parent is runtime information
    // Not need in AST
    // For example, top Root Node like `Document` has not parent.
    parent?: TxtNode;

    [index: string]: any;
}


/**
 * Location
 */
interface TxtNodeLineLocation {
    start: TxtNodePosition;
    end: TxtNodePosition;
}

/**
 * Position's line start with 1.
 * Position's column start with 0.
 * This is for compatibility with JavaScript AST.
 * https://gist.github.com/azu/8866b2cb9b7a933e01fe
 */
interface TxtNodePosition {
    line: number; // start with 1
    column: number; // start with 0
}

/**
 * Range start with 0
 */
type TextNodeRange = [number, number];

```

`TxtNode` **must** have these properties.

- `type`: type of Node
- `raw`: raw value of Node
    - if you want to get raw value, please use `getSource(<node>)` instead of it..
- `loc`: location object
- `range`: location info array like `[startIndex, endIndex]`
- `parent`: (optional) parent node of this node. 
    - It is attached in runtime
    - Parser user ignore this property
    
### `TxtTextNode` 

`TxtTextNode` is inherit the `TxtNode` abstract interface.

```typescript
/**
 * Text Node.
 * Text Node has inline value.
 * For example, `Str` Node is an TxtTextNode.
 */
interface TxtTextNode extends TxtNode {
    value: string;
}
```

`TxtTextNode` **must** have these properties.

- `value`: the value of inline node.

Example: `Str` node is a `TxtTextNode`.

### `TxtParentNode`
 
`TxtParentNode` is inherit the `TxtNode` abstract interface.

```typescript
/**
 * Parent Node.
 * Parent Node has children that are consist of TxtNode or TxtTextNode
 */
interface TxtParentNode extends TxtNode {
    children: Array<TxtNode | TxtTextNode>;
}
```

`TxtParentNode` **must** have these properties.

- `children`: child nodes of this node.

Example: `Paragraph` node is a `TxtParentNode`.

### `type`

`type` is TxtNode type.

All Types are defined in `@textlint/ast-node-types`.
You can use this `ASTNodeTypes` value via following way:

```js
import { ASTNodeTypes } from "@textlint/ast-node-types";
console.log(ASTNodeTypes.Str); // "Str"
```

You can get Node type for Type name by `TypeofTxtNode` in TypeScript.

```ts
// In TypeScript
import { ASTNodeTypes } from "@textlint/ast-node-types";
const nodeType = TypeofTxtNode<ASTNodeTypes.Str>; // TxtTextNode
```

These types are be defined in `@textlint/ast-node-types`.

| Type name                       | Node type     | Description                          |
| ------------------------------- | ------------- | ------------------------------------ |
| ASTNodeTypes.Document           | TxtParentNode | Root Node                            |
| ASTNodeTypes.DocumentExit       | TxtParentNode |                                      |
| ASTNodeTypes.Paragraph          | TxtParentNode | Paragraph Node                       |
| ASTNodeTypes.ParagraphExit      | TxtParentNode |                                      |
| ASTNodeTypes.BlockQuote         | TxtParentNode | > Str                                |
| ASTNodeTypes.BlockQuoteExit     | TxtParentNode |                                      |
| ASTNodeTypes.List               | TxtParentNode | List Node                            |
| ASTNodeTypes.ListExit           | TxtParentNode |                                      |
| ASTNodeTypes.ListItem           | TxtParentNode | List (each) item Node                |
| ASTNodeTypes.ListItemExit       | TxtParentNode |                                      |
| ASTNodeTypes.Header             | TxtParentNode | # Header Node                        |
| ASTNodeTypes.HeaderExit         | TxtParentNode |                                      |
| ASTNodeTypes.CodeBlock          | TxtParentNode | Code Block Node                      |
| ASTNodeTypes.CodeBlockExit      | TxtParentNode |                                      |
| ASTNodeTypes.HtmlBlock          | TxtParentNode | HTML Block Node                      |
| ASTNodeTypes.HtmlBlockExit      | TxtParentNode |                                      |
| ASTNodeTypes.Link               | TxtParentNode | Link Node                            |
| ASTNodeTypes.LinkExit           | TxtParentNode |                                      |
| ASTNodeTypes.ReferenceDef       | TxtParentNode | Link Reference Node(`[link][]`)      |
| ASTNodeTypes.ReferenceDefExit   | TxtParentNode |                                      |
| ASTNodeTypes.Delete             | TxtParentNode | Delete Node(`~Str~`)                 |
| ASTNodeTypes.DeleteExit         | TxtParentNode |                                      |
| ASTNodeTypes.Emphasis           | TxtParentNode | Emphasis(`*Str*`)                    |
| ASTNodeTypes.EmphasisExit       | TxtParentNode |                                      |
| ASTNodeTypes.Strong             | TxtParentNode | Strong Node(`**Str**`)               |
| ASTNodeTypes.StrongExit         | TxtParentNode |                                      |
| ASTNodeTypes.Break              | TxtNode       | Hard Break Node(`Str<space><space>`) |
| ASTNodeTypes.BreakExit          | TxtNode       |                                      |
| ASTNodeTypes.Image              | TxtNode       | Image Node                           |
| ASTNodeTypes.ImageExit          | TxtNode       |                                      |
| ASTNodeTypes.HorizontalRule     | TxtNode       | Horizontal Node(`---`)               |
| ASTNodeTypes.HorizontalRuleExit | TxtNode       |                                      |
| ASTNodeTypes.Comment            | TxtTextNode   | Comment Node                         |
| ASTNodeTypes.CommentExit        | TxtTextNode   |                                      |
| ASTNodeTypes.Str                | TxtTextNode   | Str Node                             |
| ASTNodeTypes.StrExit            | TxtTextNode   |                                      |
| ASTNodeTypes.Code               | TxtTextNode   | Inline Code Node                     |
| ASTNodeTypes.CodeExit           | TxtTextNode   |                                      |
| ASTNodeTypes.Html               | TxtTextNode   | Inline HTML Node                     |
| ASTNodeTypes.HtmlExit           | TxtTextNode   |                                      |




The type is based on HTML tag and Markdown syntax.
Other plugin has define other node type that is not defined in `@textlint/ast-node-types`, but you can specify it as just a string.

### Minimal node property

TxtAST allow to extend node property.
But, Following node **should** have some properties.

#### `Header`

- `depth`: level of header
    - Example: `<h1>` is `depth:1`, `<h2>` is `depth:2`...

#### `Link`

- `url`: link url

#### `Image`

- `url`: image url

## Built-in Parser

textlint has built-in parsers.

| Package | Version | Description |
|---------|---------|-------------|
| [`@textlint/markdown-to-ast-to-ast`](https://github.com/textlint/textlint/tree/master/packages/@textlint/markdown-to-ast) | [![npm](https://img.shields.io/npm/v/@textlint/markdown-to-ast.svg?style=flat-square)](https://www.npmjs.com/package/@textlint/markdown-to-ast) | markdown parser |
| [`@textlint/text-to-ast`](https://github.com/textlint/textlint/tree/master/packages/@textlint/text-to-ast) | [![npm](https://img.shields.io/npm/v/@textlint/text-to-ast.svg?style=flat-square)](https://www.npmjs.com/package/@textlint/text-to-ast) | plain text parser |

If you want to get other type, please [create new issue](https://github.com/textlint/textlint/issues/new).

## Package

That `TxtNode` interface is defined in [packages/ast-node-types](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-node-types).

If you want to use this interface from TypeScript, [packages/ast-node-types](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-node-types) is useful.

## Online Parsing Demo

[![ast-explorer fork](assets/ast-explorer.png)](https://textlint.github.io/astexplorer/)

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

Output: The AST by [AST explorer for textlint](https://textlint.github.io/astexplorer/ "AST explorer for textlint") + Markdown

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

`TxtAST` have a minimum of compatibility for [unist: Universal Syntax Tree](https://github.com/syntax-tree/unist "wooorm/unist: Universal Syntax Tree").

We discuss about Unist in [Compliances tests for TxtNode #141](https://github.com/textlint/textlint/issues/141 "Compliances tests for TxtNode #141").

## For testing Processor plugin

You can use [@textlint/ast-tester](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-tester "@textlint/ast-tester") for testing your processor plugin's parser.

- [textlint/@textlint/ast-tester: Compliance tests for textlint's AST](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-tester)

```js
import { test, isTextlintAST } from "@textlint/ast-tester";
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

For example, markdown's `Header` node has `level` property, but other format has not it.
