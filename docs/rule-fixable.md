---
id: rule-fixable
title: Creating Fixable Rule
---

textlint has `linter` and also has `fixer`.

```js
export default function reporter(context) {}
```

is shorthand function syntax of  

```js
function reporter(context) {}
export default {
    linter: reporter
};
```

:information_source: You should know [Creating Rules](./rule.md) in advance.

Now, you can implement `fixer` like that:

```js
function reporter(context) {
    // report error and fix command
}
export default {
    linter: reporter,
    fixer: reporter
};
```

## Replace a thumbs-up emoji with a shortcode

This rule reports each plain 👍 in a text node and fixes it to `:+1:`. It uses `Intl.Segmenter` to read one visible character at a time, so a skin-tone variant such as 👍🏽 stays intact. The segment offsets and lengths are measured in UTF-16 code units. Pass them to the locator and fixer relative to the start of the text node.

Save the rule as `prefer-plus-one-shortcode.mjs`.

```js
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function reporter(context) {
    const { Syntax, RuleError, fixer, report, getSource, locator } = context;
    return {
        [Syntax.Str](node) {
            for (const { segment, index } of segmenter.segment(getSource(node))) {
                if (segment !== "👍") {
                    continue;
                }
                const range = [index, index + segment.length];
                report(
                    node,
                    new RuleError("Use :+1: for the thumbs-up emoji.", {
                        padding: locator.range(range),
                        fix: fixer.replaceTextRange(range, ":+1:")
                    })
                );
            }
        }
    };
}

export default { linter: reporter, fixer: reporter };
```

Save this test as `prefer-plus-one-shortcode.test.mjs` next to the rule. The emoji before the two thumbs-up characters takes two UTF-16 code units, so the first replacement starts at offset 3.

```js
import textlintTester from "textlint-tester";
import rule from "./prefer-plus-one-shortcode.mjs";

const { default: TextLintTester } = textlintTester;
const tester = new TextLintTester();
tester.run("prefer-plus-one-shortcode", rule, {
    valid: [":+1:", "👍🏽"],
    invalid: [
        {
            text: "😀 👍👍",
            output: "😀 :+1::+1:",
            errors: [
                { message: "Use :+1: for the thumbs-up emoji.", range: [3, 5] },
                { message: "Use :+1: for the thumbs-up emoji.", range: [5, 7] }
            ]
        }
    ]
});
```

After installing the test dependencies, run `npx mocha prefer-plus-one-shortcode.test.mjs`. [Test dependencies](./rule.md#manually-installation)

The `context.fixer.` object has the following methods:

* `fixer.insertTextAfter(node, text)` - inserts text after the given node
* `fixer.insertTextAfterRange(range, text)` - inserts text after the given range
* `fixer.insertTextBefore(node, text)` - inserts text before the given node
* `fixer.insertTextBeforeRange(range, text)` - inserts text before the given range
* `fixer.remove(node)` - removes the given node
* `fixer.removeRange(range)` - removes text in the given range
* `fixer.replaceText(node, text)` - replaces the text in the given node
* `fixer.replaceTextRange(range, text)` - replaces the text in the given range

Best practices for fixes:

1. Make fixes that are as small as possible. Anything more than a single character is risky and could prevent other, simpler fixes from being made.
2. Make one fix per message.

## Publishing

You can publish fixable rule to npm that is the same way of a [rule](./rule.md)

Be careful to following points.

### `fixable` feature is newer

Old `textlint` not support fixable feature, so old `textlint` don't understand `fixable`.
As a result, old `textlint` throw error.

> Error: Definition for rule 'rule-name' was not found.

We recommended that add `peerDependencies` to `package.json`

```
  "peerDependencies": {
    "textlint": ">= 5.5.0"
  }
```

### Display fixable or not

If your textlint's rule is *fixable*, display "this rule is fixable!".

We have *fixable* rule badge and use it!

[![textlint rule](https://img.shields.io/badge/textlint-fixable-green.svg?style=social)](https://textlint.org/) 

```markdown
[![textlint rule](https://img.shields.io/badge/textlint-fixable-green.svg?style=social)](https://textlint.org/) 
```

## Terms

- fixble rule: A rule report error that could be fixed
    - **fixable** is **fix**-able.
