// LICENSE : MIT
"use strict";
var parse = require("../").parse;
var Syntax = require("../").Syntax;
var assert = require("power-assert");
describe("plaintext-parser-test", function () {
    context("Document", function () {
        it("should return AST", function () {
            var text = "text";
            var ast = parse(text);
            assert(typeof ast === "object");
            // top type is always Document
            assert.equal(ast.type, Syntax.Document);
            assert.equal(ast.raw, text);
            assert.deepEqual(ast.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 1,
                    column: text.length
                }
            });
            assert.deepEqual(ast.range, [0, text.length]);
            // should has children
            assert(ast.children.length > 0);
        });
    });
    context("Paragraph", function () {
        it("should contain Str node", function () {
            var text = "Hello world";
            var ast = parse(text);
            var expected = {
                "type": "Document",
                "range": [
                    0,
                    11
                ],
                "raw": text,
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0 // column start with 0
                    },
                    "end": {
                        "line": 1,
                        "column": 11
                    }
                },
                "children": [
                    {
                        "type": "Paragraph",
                        "raw": "Hello world",
                        "range": [
                            0,
                            11
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 0
                            },
                            "end": {
                                "line": 1,
                                "column": 11
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "Hello world",
                                "value": "Hello world",
                                "range": [
                                    0,
                                    11
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 11
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            assert.deepEqual(ast, expected)
        });
    });
    context("Paragraph ended with break line", function () {
        it("should contain Break node", function () {
            var text = "text\n";
            var ast = parse(text);
            // Paragraph -> Break
            var expected = {
                "type": "Document",
                "range": [
                    0,
                    5
                ],
                "raw": text,
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 2,
                        "column": 0
                    }
                },
                "children": [
                    {
                        "type": "Paragraph",
                        "raw": "text",
                        "range": [
                            0,
                            4
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 0
                            },
                            "end": {
                                "line": 1,
                                "column": 4
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "text",
                                "value": "text",
                                "range": [
                                    0,
                                    4
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "type": "Break",
                        "raw": "\n",
                        "value": "\n",
                        "range": [
                            4,
                            5
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 4
                            },
                            "end": {
                                "line": 1,
                                "column": 5
                            }
                        }
                    }
                ]
            };
            assert.deepEqual(ast, expected)
        });
    });
    context("Paragraph + BR + Paragraph", function () {
        it("should equal to P + BR + P", function () {
            var text = "text\ntext";
            var ast = parse(text);
            // Paragraph -> Break -> Paragraph
            var expected = {
                "type": "Document",
                "range": [
                    0,
                    text.length
                ],
                "raw": text,
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 2,
                        "column": 4
                    }
                },
                "children": [
                    {
                        "type": "Paragraph",
                        "raw": "text",
                        "range": [
                            0,
                            4
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 0
                            },
                            "end": {
                                "line": 1,
                                "column": 4
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "text",
                                "value": "text",
                                "range": [
                                    0,
                                    4
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "type": "Break",
                        "raw": "\n",
                        "value": "\n",
                        "range": [
                            4,
                            5
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 4
                            },
                            "end": {
                                "line": 1,
                                "column": 5
                            }
                        }
                    },
                    {
                        "type": "Paragraph",
                        "raw": "text",
                        "range": [
                            5,
                            9
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 0
                            },
                            "end": {
                                "line": 2,
                                "column": 4
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "text",
                                "value": "text",
                                "range": [
                                    5,
                                    9
                                ],
                                "loc": {
                                    "start": {
                                        "line": 2,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 2,
                                        "column": 4
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            assert.deepEqual(ast, expected)
        });
    });
    context("Paragraph + BR + BR + Paragraph", function () {
        it("should equal to P + BR + BR + P", function () {
            var text = "text\n" +
                "\n" +
                "text";
            var ast = parse(text);

            // Paragraph -> Break -> Paragraph
            var expected = {
                "type": "Document",
                "range": [
                    0,
                    text.length
                ],
                "raw": text,
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 3,
                        "column": 4
                    }
                },
                "children": [
                    {
                        "type": "Paragraph",
                        "raw": "text",
                        "range": [
                            0,
                            4
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 0
                            },
                            "end": {
                                "line": 1,
                                "column": 4
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "text",
                                "value": "text",
                                "range": [
                                    0,
                                    4
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 4
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "type": "Break",
                        "raw": "\n",
                        "value": "\n",
                        "range": [
                            4,
                            5
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 4
                            },
                            "end": {
                                "line": 1,
                                "column": 5
                            }
                        }
                    },
                    {
                        "type": "Break",
                        "raw": "\n",
                        "range": [
                            5,
                            6
                        ],
                        "loc": {
                            "start": {
                                "line": 2,
                                "column": 0
                            },
                            "end": {
                                "line": 2,
                                "column": 1
                            }
                        }
                    },
                    {
                        "type": "Paragraph",
                        "raw": "text",
                        "range": [
                            6,
                            10
                        ],
                        "loc": {
                            "start": {
                                "line": 3,
                                "column": 0
                            },
                            "end": {
                                "line": 3,
                                "column": 4
                            }
                        },
                        "children": [
                            {
                                "type": "Str",
                                "raw": "text",
                                "value": "text",
                                "range": [
                                    6,
                                    10
                                ],
                                "loc": {
                                    "start": {
                                        "line": 3,
                                        "column": 0
                                    },
                                    "end": {
                                        "line": 3,
                                        "column": 4
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            assert.deepEqual(ast, expected)
        });
    })
});