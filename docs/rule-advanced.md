---
id: rule-advanced
title: Advanced: Paragraph Rule
---

## Readme

You have already read following document.

- [Creating Rules](./rule.md)

This tutorial describe that creating a rule to handle `Paragraph` nodes.

## Using Code Examples

You can see finished module in the tutorial.

- [textlint-rule-en-max-word-count](https://github.com/azu/textlint-rule-en-max-word-count "textlint-rule-en-max-word-count")

The rule that specify the maximum word count of a **sentence**.

## Using Library

These library are used in the module.

- [sentence-splitter](https://www.npmjs.com/package/sentence-splitter)
- [textlint-util-to-string](https://www.npmjs.com/package/textlint-util-to-string)
- [unist-util-map](https://www.npmjs.com/package/unist-util-map)
- [split-string-words](https://www.npmjs.com/package/split-string-words)


## Terms

- **Paragraph** is a type of [`TxtParentNode`](./txtnode.md#txtparentnode).
    - Paragraph has `children` nodes.
- **Sentence** is not defined in textlint.
    - It has language dependency.
    - [textlint-rule-en-max-word-count](https://github.com/azu/textlint-rule-en-max-word-count "textlint-rule-en-max-word-count") is for English.
    - It is created from **Paragraph** text by [sentence-splitter](https://www.npmjs.com/package/sentence-splitter)
- **Word** is not defined in textlint.
    - It has language dependency.
    - [textlint-rule-en-max-word-count](https://github.com/azu/textlint-rule-en-max-word-count "textlint-rule-en-max-word-count") is for English.
    - It is created from **Sentence** text by [split-string-words](https://www.npmjs.com/package/split-string-words)

## 1. Start

To create a rule that specify the maximum **word** count of a **sentence**.

```js
// Default options
const defaultOptions = {
    // max count of words >
    max: 50
};
/**
 * @param {TextLintRuleContext} context
 * @param {Object} options
 */
export default function(context, options = {}) {
    const { Syntax, getSource, RuleError, report } = context;
    const maxWordCount = options.max ? options.max : defaultOptions.max;
    return {
        [Syntax.Paragraph](node) {
            // node is Paragraph node
            // Paragraph contain `Code`, `Str`, `Strong` node etc...
        }
    };
}
```

### 2. Ignore `Code` node

`Paragraph` node contain `Code`, `Str`, `Strong` node etc...

```
This is text.
```

is described as `Paragraph.children = ["Str"]`

:information_source: Info:

- Please see [txtnode.md](./txtnode.md) for Abstract Syntax Tree details.
- Use [Markdown-to-AST demo](http://azu.github.io/markdown-to-ast/example/)

But, Following `Paragraph` node contain `Code` node. 

```
This text contain `var a = "string";` code.
```

How do you handle `Code` node?

1. Ignore `Code`.
    - [textlint-rule-rousseau](https://github.com/azu/textlint-rule-rousseau "textlint-rule-rousseau") apply ignoring pattern.
    - [textlint-rule-helper](https://github.com/textlint/textlint-rule-helper "textlint-rule-helper") provide `IgnoreNodeManger` that is useful for ignoring some node.
2. Replace `Code` to dummy object that is a single **word**.

In this case, We select *Case 2*.

Replace `Code` to dummy object that is a single **word** Using [unist-util-map](https://github.com/syntax-tree/unist-util-map "unist-util-map").

```js
// Helper for creating new AST using map function
// https://github.com/azu/unist-util-map
// if you want to filter, use https://github.com/eush77/unist-util-filter
import map from "unist-util-map";
// Default options
const defaultOptions = {
    // max count of words >
    max: 50
};
/**
 * @param {TextLintRuleContext} context
 * @param {Object} options
 */
export default function(context, options = {}) {
    const { Syntax, getSource, RuleError, report } = context;
    const maxWordCount = options.max ? options.max : defaultOptions.max;
    return {
        [Syntax.Paragraph](node) {
            // replace code with dummy code
            // if you want to filter(remove) code, use https://github.com/eush77/unist-util-filter
            const filteredNode = map(node, node => {
                if (node.type === Syntax.Code) {
                    // only change `value` to dummy
                    return Object.assign({}, node, {
                        value: "code"
                    });
                }
                return node;
            });
        }
    };
}
```

### 3. Get text of a Paragraph

We can get text from a node with **Source Map** using [textlint-util-to-string](https://www.npmjs.com/package/textlint-util-to-string).

Why does we use [textlint-util-to-string](https://www.npmjs.com/package/textlint-util-to-string)?

Because, we report error via `context.report` with original position of the text.

```js
// Helper for creating new AST using map function
// https://github.com/azu/unist-util-map
// if you want to filter, use https://github.com/eush77/unist-util-filter
import map from "unist-util-map";
// Helper for converting plain text from Syntax-ed text(markdown AST
// https://github.com/azu/textlint-util-to-string
import StringSource from "textlint-util-to-string";
// Default options
const defaultOptions = {
    // max count of words >
    max: 50
};
/**
 * @param {TextLintRuleContext} context
 * @param {Object} options
 */
export default function(context, options = {}) {
    const { Syntax, getSource, RuleError, report } = context;
    const maxWordCount = options.max ? options.max : defaultOptions.max;
    return {
        [Syntax.Paragraph](node) {
            // replace code with dummy code
            // if you want to filter(remove) code, use https://github.com/eush77/unist-util-filter
            const filteredNode = map(node, node => {
                if (node.type === Syntax.Code) {
                    // only change `value` to dummy
                    return Object.assign({}, node, {
                        value: "code"
                    });
                }
                return node;
            });
            // create StringSource
            const source = new StringSource(filteredNode);
            // text in a paragraph
            const text = source.toString();
        }
    };
}
```

### 4. Create Sentences from Paragraph

[sentence-splitter](https://www.npmjs.com/package/sentence-splitter) split text to `Sentence`s.

```js
// Helper for creating new AST using map function
// https://github.com/azu/unist-util-map
// if you want to filter, use https://github.com/eush77/unist-util-filter
import map from "unist-util-map";
// Helper for converting plain text from Syntax-ed text(markdown AST
// https://github.com/azu/textlint-util-to-string
import StringSource from "textlint-util-to-string";
// Helper for splitting text to sentences
// https://github.com/azu/sentence-splitter
import { split as splitSentence, Syntax as SplitterSyntax } from "sentence-splitter";
// Default options
const defaultOptions = {
    // max count of words >
    max: 50
};
/**
 * @param {TextLintRuleContext} context
 * @param {Object} options
 */
export default function(context, options = {}) {
    const { Syntax, getSource, RuleError, report } = context;
    const maxWordCount = options.max ? options.max : defaultOptions.max;
    return {
        [Syntax.Paragraph](node) {
            // replace code with dummy code
            // if you want to filter(remove) code, use https://github.com/eush77/unist-util-filter
            const filteredNode = map(node, node => {
                if (node.type === Syntax.Code) {
                    // only change `value` to dummy
                    return Object.assign({}, node, {
                        value: "code"
                    });
                }
                return node;
            });
            const source = new StringSource(filteredNode);
            // text in a paragraph
            const text = source.toString();
            // get sentences from Paragraph
            const sentences = splitSentence(text).filter(node => {
                // ignore break line
                return node.type === SplitterSyntax.Sentence;
            });
            // text in a sentence
            sentences.forEach(sentence => {
                /* sentence object is a node
                {
                    type: "Sentence",
                    raw: text,
                    value: text,
                    loc: loc,
                    range: range
                };
                 */
                const sentenceText = sentence.value;
            });
        }
    };
}
```


### 4. Get words in a sentence

Split a **Sentence** to **Word**s using [split-string-words](https://www.npmjs.com/package/split-string-words).

```js
// Helper for creating new AST using map function
// https://github.com/azu/unist-util-map
// if you want to filter, use https://github.com/eush77/unist-util-filter
import map from "unist-util-map";
// Helper for converting plain text from Syntax-ed text(markdown AST
// https://github.com/azu/textlint-util-to-string
import StringSource from "textlint-util-to-string";
// Helper for splitting text to sentences
// https://github.com/azu/sentence-splitter
import { split as splitSentence, Syntax as SplitterSyntax } from "sentence-splitter";
// Helper for splitting text to words
// https://github.com/timjrobinson/split-string-words
import splitWord from "split-string-words";
// Default options
const defaultOptions = {
    // max count of words >
    max: 50
};
/**
 * @param {TextLintRuleContext} context
 * @param {Object} options
 */
export default function(context, options = {}) {
    const { Syntax, getSource, RuleError, report } = context;
    const maxWordCount = options.max ? options.max : defaultOptions.max;
    return {
        [Syntax.Paragraph](node) {
            // replace code with dummy code
            // if you want to filter(remove) code, use https://github.com/eush77/unist-util-filter
            const filteredNode = map(node, node => {
                if (node.type === Syntax.Code) {
                    // only change `value` to dummy
                    return Object.assign({}, node, {
                        value: "code"
                    });
                }
                return node;
            });
            const source = new StringSource(filteredNode);
            // text in a paragraph
            const text = source.toString();
            // get sentences from Paragraph
            const sentences = splitSentence(text).filter(node => {
                // ignore break line
                return node.type === SplitterSyntax.Sentence;
            });
            // text in a sentence
            sentences.forEach(sentence => {
                /* sentence object is a node
                {
                    type: "Sentence",
                    raw: text,
                    value: text,
                    loc: loc,
                    range: range
                };
                 */
                const sentenceText = sentence.value;
                // words in a sentence
                const words = splitWord(sentenceText);
                // over count of word, then report error
                if (words.length > maxWordCount) {
                    // get original index value of sentence.loc.start
                    const originalIndex = source.originalIndexFromPosition(sentence.loc.start);
                    const ruleError = new RuleError(`Exceeds the maximum word count of ${maxWordCount}.`, {
                        index: originalIndex
                    });
                    report(node, ruleError);
                }
            });
        }
    };
}
```

If the count of word is over max, report this as RuleError.

```js
// over count of word, then report error
if (words.length > maxWordCount) {
    // get original index value of sentence.loc.start
    const originalIndex = source.originalIndexFromPosition(sentence.loc.start);
    const ruleError = new RuleError(`Exceeds the maximum word count of ${maxWordCount}.`, {
        index: originalIndex
    });
    report(node, ruleError);
}
```

You can get original index from position of **Sentence** node.

```js
const originalIndex = source.originalIndexFromPosition(sentence.loc.start);
```

## Testing

Test the rule with [textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester").

```js
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
// rule
import rule from "../src/textlint-rule-en-max-word-count";
// ruleName, rule, { valid, invalid }
tester.run("max-word-count", rule, {
    valid: [
        // no match
        {
            text: "This is pen.",
            options: {
                max: 3
            }
        },
        // replace Code block to a word
        {
            text: "This is `code is a word`.",
            options: {
                max: 3
            }
        }
    ],
    invalid: [
        // single match
        {
            text: "This is a pen.",
            options: {
                max: 3
            },
            errors: [
                {
                    message: "Exceeds the maximum word count of 3.",
                    line: 1,
                    column: 1
                }
            ]
        },
        // multiple match in multiple lines
        {
            text: `This is a pen.
            
This is not a pen.`,
            options: {
                max: 3
            },
            errors: [
                {
                    message: "Exceeds the maximum word count of 3.",
                    line: 1,
                    column: 1
                },
                {
                    message: "Exceeds the maximum word count of 3.",
                    line: 3,
                    column: 1
                }
            ]
        },
        // multiple hit items in a line
        {
            text: "This is a pen.This is not a pen.",
            options: {
                max: 3
            },
            errors: [
                {
                    message: "Exceeds the maximum word count of 3.",
                    line: 1,
                    column: 1
                },
                {
                    message: "Exceeds the maximum word count of 3.",
                    line: 1,
                    column: 15
                }
            ]
        },
        // It is a single sentence
        {
            text: "This is a pen This is not a pen.",
            options: {
                max: 3
            },
            errors: [
                {
                    message: "Exceeds the maximum word count of 3.",
                    line: 1,
                    column: 1
                }
            ]
        }
    ]
});
```

## Complete!

See completed source code in [textlint-rule-en-max-word-count](https://github.com/azu/textlint-rule-en-max-word-count "textlint-rule-en-max-word-count")
