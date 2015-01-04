# txt-to-ast

Parse plain text to AST with location info.

This library is a part of [azu/textlint](https://github.com/azu/textlint "azu/textlint").

A `TxtNode` of the AST has following properties:

- `loc` - Nodes have line and column-based location info.
- `range` - Nodes have an index-based location range (array).
- `raw` - Node have a `raw` text.

The interface defined as [txtnode.d.ts](typing/txtnode.d.ts).


## Installation

```
npm install txt-to-ast
```

## Usage

```js
var parse = require("txt-to-ast").parse;
var text = "This is a text";
var AST = parse(text);
console.log(JSON.stringify(AST, null ,4))
/*
{
    "type": "Document",
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
                    "line": 1,
                    "column": 15
                }
            }
        },
        {
            "type": "Paragraph",
            "raw": "parse text to AST",
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
                    "raw": "parse text to AST",
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