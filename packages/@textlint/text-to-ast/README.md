# @textlint/text-to-ast

Parse plain text to AST with location info.

This library is a part of [textlint/textlint](https://github.com/textlint/textlint "textlint/textlint").

Markdown version: [@textlint/markdown-to-ast](https://github.com/textlint/textlint/tree/master/packages/@textlint/markdown-to-ast "textlint/markdown-to-ast")

The AST uses four node types of [TxtAST](https://github.com/textlint/textlint/blob/master/docs/txtnode.md "textlint/txtnode.md at master · textlint/textlint"):

- `Document` - The whole text
- `Paragraph` - A line that is not empty. It has one `Str`
- `Str` - The text of the line, without the line ending
- `Break` - A line ending (LF, CR, CRLF, U+2028, or U+2029). It is a child of `Document`

Every node has `type`, `raw`, `range`, and `loc`, and `Str` has `value`.
A BOM at the start of the text is not part of the AST.

## Installation

```
npm install @textlint/text-to-ast
```

## DEMO

- [AST explorer for textlint](https://textlint.org/astexplorer/ "AST explorer for textlint")

## Usage

```js
import { parse } from "@textlint/text-to-ast";
const text = "This is a text\nParse text to AST";
const AST = parse(text);
console.log(JSON.stringify(AST, null, 4));
/*
{
    "type": "Document",
    "raw": "This is a text\nParse text to AST",
    "range": [
        0,
        32
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 2,
            "column": 17
        }
    },
    "children": [
        {
            "type": "Paragraph",
            "raw": "This is a text",
            "range": [
                0,
                14
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 14
                }
            },
            "children": [
                {
                    "type": "Str",
                    "raw": "This is a text",
                    "value": "This is a text",
                    "range": [
                        0,
                        14
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 14
                        }
                    }
                }
            ]
        },
        {
            "type": "Break",
            "raw": "\n",
            "range": [
                14,
                15
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 14
                },
                "end": {
                    "line": 2,
                    "column": 0
                }
            }
        },
        {
            "type": "Paragraph",
            "raw": "Parse text to AST",
            "range": [
                15,
                32
            ],
            "loc": {
                "start": {
                    "line": 2,
                    "column": 0
                },
                "end": {
                    "line": 2,
                    "column": 17
                }
            },
            "children": [
                {
                    "type": "Str",
                    "raw": "Parse text to AST",
                    "value": "Parse text to AST",
                    "range": [
                        15,
                        32
                    ],
                    "loc": {
                        "start": {
                            "line": 2,
                            "column": 0
                        },
                        "end": {
                            "line": 2,
                            "column": 17
                        }
                    }
                }
            ]
        }
    ]
}
*/
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
