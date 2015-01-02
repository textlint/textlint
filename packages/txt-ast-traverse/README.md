# txt-ast-traverse

txt-ast-traverse provide traversal functions for [Markdown AST](https://github.com/azu/markdown-to-ast/ "azu/markdown-to-ast").

This library is a fork of [estraverse](https://github.com/estools/estraverse "Estraverse") for [azu/markdown-to-ast](https://github.com/azu/markdown-to-ast/ "azu/markdown-to-ast").

## Installation

- [ ] Describe the installation process

## Usage

- [ ] Write usage instructions

## Action

Markdown:

```markdown
Hello *world*
```

AST:

```json
{
    "start_line": 1,
    "start_column": 1,
    "end_line": 0,
    "children": [
        {
            "start_line": 1,
            "start_column": 1,
            "end_line": 0,
            "inline_content": [
                {
                    "c": "Hello",
                    "raw": "Hello",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 5
                        }
                    },
                    "range": [
                        0,
                        5
                    ],
                    "type": "Str"
                },
                {
                    "c": " ",
                    "raw": " ",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 5
                        },
                        "end": {
                            "line": 1,
                            "column": 6
                        }
                    },
                    "range": [
                        5,
                        6
                    ],
                    "type": "Str"
                },
                {
                    "c": [
                        {
                            "c": "world",
                            "raw": "world",
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 0
                                },
                                "end": {
                                    "line": 1,
                                    "column": 5
                                }
                            },
                            "range": [
                                0,
                                5
                            ],
                            "type": "Str"
                        }
                    ],
                    "raw": "*world*",
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 6
                        },
                        "end": {
                            "line": 1,
                            "column": 13
                        }
                    },
                    "range": [
                        6,
                        13
                    ],
                    "type": "Emphasis"
                }
            ],
            "children": [],
            "raw": "Hello *world*",
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
            "type": "Paragraph"
        }
    ],
    "raw": "Hello *world*",
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
    "type": "Document"
}
```

### Classify Node

- So-called `Node` has `t` or `type`
- `inline_content` wrapped Nodes.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT

and 

Includes [Estraverse](https://github.com/estools/estraverse "Estraverse")
    
    Copyright (C) 2012-2013 Yusuke Suzuki
    https://github.com/estools/estraverse/blob/master/LICENSE.BSD