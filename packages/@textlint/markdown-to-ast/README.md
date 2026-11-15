# @textlint/markdown-to-ast

Parse Markdown to AST with location info.

This library is a [CommonMark](https://spec.commonmark.org/) + [GFM](https://github.github.com/gfm/) parser that produces `TxtNode`s directly.
It has no third-party dependencies.

> Markdown -> markdown-to-ast -> `TxtNode`s

Supported syntax:

- [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/)
- [GFM](https://github.github.com/gfm/): tables, strikethrough, task list items, and autolink literals
- Footnotes(`[^1]` and `[^1]: note`) and inline notes(`^[note]`)
- Front matter: YAML(`---`), TOML(`+++`), JSON(`;;;` or `{`)

The parser follows CommonMark for everything CommonMark defines, and GFM for the extensions GFM defines.
The node of each syntax, its properties, and its range are defined in the [Markdown parsing requirements](https://github.com/textlint/textlint/blob/master/docs/products/textlint/features/markdown-parsing/requirements.md).

Front matter and footnotes are not part of CommonMark/GFM, so their nodes are extension nodes with lowercase type names: `yaml`, `toml`, `json`, `footnoteReference`, `footnoteDefinition`, and `footnote`.

The AST consists of `TxtNode`s.
A `TxtNode` of the AST has following properties:

- `loc` - Nodes have line and column-based location info.
- `range` - Nodes have an index-based location range (array).
- `raw` - Node have a `raw` text.
- `value` - Node have a `value` of text.

`raw`, `range`, and `loc` of a node always describe the same span of the text.

The interface are defined in [textlint/txtnode.md](https://github.com/textlint/textlint/blob/master/docs/txtnode.md "textlint/txtnode.md at master · textlint/textlint")

This library is a part of [textlint/textlint](https://github.com/textlint/textlint "textlint/textlint").

**If you need a general-purpose Markdown parser (mdast, HTML output, plugins), please use [remark](https://github.com/remarkjs/remark) directly.**

## Design

The parser is written with data-oriented design for performance.
See the [Markdown parsing design](https://github.com/textlint/textlint/blob/master/docs/products/textlint/features/markdown-parsing/design.md) for details.

- Nodes are stored in flat typed arrays (struct of arrays) and refer to each other by index while parsing
- Strings are not copied while parsing. `raw` and `value` are sliced from the source text when the AST is emitted
- `TxtNode` objects are created only once at the end. There is no intermediate AST such as mdast
- Working buffers are reused between `parse()` calls
- Parsing time is proportional to the size of the text, including for inputs that repeat unclosed syntax

### Nesting limit

The parser does not overflow the call stack for deeply nested inputs.

- The nesting depth is limited to 100 for block containers (`BlockQuote`, `List`, `ListItem`, `footnoteDefinition`) and 100 for inline nodes (`Emphasis`, `Strong`, `Delete`, `Link`, `LinkReference`, `footnote`)
- The markers beyond the limit are not parsed as syntax. They are kept as text
- The tree is built and emitted with loops and explicit stacks instead of recursion

## DEMO

- [textlint AST explorer](https://textlint.org/astexplorer/ "textlint AST explorer")

## Installation

```
npm install @textlint/markdown-to-ast
```

## Usage

```js
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

If you want to know real use-case, please see [textlint/textlint](https://github.com/textlint/textlint "textlint/textlint").


### Options

`parse(text, options)` takes these options. All of them are `false` by default.

- `cjkFriendlyEmphasis`: Recognize emphasis, strong emphasis, and strikethrough next to CJK punctuation, as the [CommonMark CJK-friendly Amendments](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md) define. `**強調。**この文` becomes `Strong` and `Str`.

```js
const AST = parse("**強調。**この文", { cjkFriendlyEmphasis: true });
```

## Tests

```
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
