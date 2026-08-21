# @textlint/markdown-to-ast

Parse Markdown to AST with location info.

This library is not parser itself, it dependent on [wooorm/remark](https://github.com/wooorm/remark).

> Markdown -> remark -> markdown-to-ast -> `TxtNode`s

The AST consists of `TxtNode`s.
A `TxtNode` of the AST has following properties:

- `loc` - Nodes have line and column-based location info.
- `range` - Nodes have an index-based location range (array).
- `raw` - Node have a `raw` text.
- `value` - Node have a `value` of text.

The interface are defined in [textlint/txtnode.md](https://github.com/textlint/textlint/blob/master/docs/txtnode.md "textlint/txtnode.md at master · textlint/textlint")

This library is a part of [textlint/textlint](https://github.com/textlint/textlint "textlint/textlint").

**If you need to markdown parser, please use [wooorm/remark](https://github.com/wooorm/remark) directly.**

## DEMO

- [textlint AST explorer](https://textlint.org/astexplorer/ "textlint AST explorer")

## Installation

```sh
npm install @textlint/markdown-to-ast
```

## Usage

```ts
import { parse } from "@textlint/markdown-to-ast";

const markdown = "It's a *text*";
const AST = parse(markdown);
/*
{
    "type": "Document",
    "children": [
        {
            "type": "Paragraph",
            "children": [
                {
                    "type": "Str",
                    "value": "It's a ",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 7
                        }
                    },
                    "range": [
                        0,
                        7
                    ],
                    "raw": "It's a "
                },
                {
                    "type": "Emphasis",
                    "children": [
                        {
                            "type": "Str",
                            "value": "text",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 8
                                },
                                "end": {
                                    "line": 1,
                                    "column": 12
                                }
                            },
                            "range": [
                                8,
                                12
                            ],
                            "raw": "text"
                        }
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 7
                        },
                        "end": {
                            "line": 1,
                            "column": 13
                        }
                    },
                    "range": [
                        7,
                        13
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
                    "column": 13
                }
            },
            "range": [
                0,
                13
            ],
            "raw": "It's a *text*"
        }
    ],
    "loc": {
        "start": {
            "line": 1,
            "column": 0
        },
        "end": {
            "line": 1,
            "column": 13
        }
    },
    "range": [
        0,
        13
    ],
    "raw": "It's a *text*"
}
*/
```

To enable CJK-friendly emphasis and GFM strikethrough parsing, set `cjkFriendly` to `true`. This option is disabled by default.

```ts
const AST = parse("**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。", {
    cjkFriendly: true
});
```

If you want to know real use-case, please see [textlint/textlint](https://github.com/textlint/textlint "textlint/textlint").

## Tests

```sh
npm test
```

### Create fixtures

See [tools/](tools/) directory.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
