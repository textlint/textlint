---
id: rule-fixable
title: Creating Fixable Rule
---

A fixable rule reports a problem together with the change that solves it.
`textlint --fix` applies these changes to the file.

:information_source: You should know [Creating Rules](./rule.md) in advance.

## `linter` and `fixer`

A rule module exports a `linter` function, and a fixable rule module also exports a `fixer` function.
Both are rule functions that receive `context` and return the handlers of the nodes.

- `textlint` calls `linter`. It reports the messages and does not change the file.
- `textlint --fix` calls `fixer`. It applies the fixes of the reported messages to the file.

A module that exports only a function is the same as a module that has only `linter`.

```js
export default function reporter(context) {}
// is the same as
export default {
    linter: reporter
};
```

Most fixable rules use the same function for both.
A module that has `fixer` must have `linter` too.

```js
function reporter(context) {
    // report errors with fixes
}
export default {
    linter: reporter,
    fixer: reporter
};
```

## Report a fix

A fix is a command that replaces a range of the text with another text.
Create it with `context.fixer`, and pass it as the `fix` property of `RuleError`.

```js
function reporter(context) {
    const { Syntax, RuleError, fixer, report, getSource, locator } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            for (const match of text.matchAll(/🎉/g)) {
                // the range of the match, relative to the start of `node`
                const range = [match.index, match.index + match[0].length];
                report(
                    node,
                    new RuleError("Use :tada: instead of 🎉.", {
                        padding: locator.range(range),
                        fix: fixer.replaceTextRange(range, ":tada:")
                    })
                );
            }
        }
    };
}
export default {
    linter: reporter,
    fixer: reporter
};
```

Creating a fix does not change the text.
textlint applies the fix after the rule has finished with the file, and only when the user runs `textlint --fix`.
Without `--fix`, the fix is a part of the message as `fix: { range, text }`, and tools such as editors can use it.

A `RuleError` has at most one fix.
A problem that needs two changes is either one fix that covers both, or two reports.

## `context.fixer`

Each method of `context.fixer` returns a fix. The methods differ in how they name the place to change.

The methods that take a `node` change the text of that node. The node can be any node, such as the parent of the reported node.

- `fixer.insertTextBefore(node, text)` - inserts text before the given node
- `fixer.insertTextAfter(node, text)` - inserts text after the given node
- `fixer.replaceText(node, text)` - replaces the text of the given node
- `fixer.remove(node)` - removes the given node

The methods that take a `range` change a part of the node passed to `report()`.

- `fixer.insertTextBeforeRange(range, text)` - inserts text before the given range
- `fixer.insertTextAfterRange(range, text)` - inserts text after the given range
- `fixer.replaceTextRange(range, text)` - replaces the text in the given range
- `fixer.removeRange(range)` - removes the text in the given range

### Range

A `range` is `[start, end]`. It includes `start` and excludes `end`.
Both are offsets from the start of the node passed to `report()`, not from the start of the file.
This is the same origin as `locator.range()` and the index of `getSource(node)`, so one range serves both `padding` and `fix`.

```js
// node is the Str "Release 🎉"
// getSource(node).indexOf("🎉") is 8
fixer.replaceTextRange([8, 10], ":tada:");
```

The offsets count UTF-16 code units, as the index and `length` of a JavaScript string do.
`🎉` is two code units, so its range is `[8, 10]`.
The values that string methods and `RegExp` return are already in this unit.

## How textlint applies fixes

`textlint --fix` runs the fixable rules one at a time, in the order of the configuration.

1. textlint runs the `fixer` of one rule on the text
2. textlint applies the fixes that the rule reported
3. The next rule receives the fixed text, parsed again

A rule always sees the text that the previous rules fixed, so the fixes of different rules do not conflict.
Each rule runs once.

textlint does not apply two fixes of one rule to the same part of the text.
When the ranges of two fixes overlap, it applies the one closer to the end of the text and leaves the other as a message that is not fixed.
The user can run `textlint --fix` again to fix it.

Best practices for fixes:

1. Make fixes that are as small as possible. A large range overlaps other fixes easily, and a fix that changes the meaning of the text is risky.
2. Make one fix per message.
3. Make a fix that does not need another fix. The fixed text should pass the rule.

## Testing

[textlint-tester](./rule.md#how-to-test-the-rule) checks the fix with the `output` property of an invalid case.
`output` is the whole text after `fixer` ran, and `range` of an error is the reported range in the text.

```js
import TextLintTester from "textlint-tester";
import rule from "./prefer-tada-shortcode.js";

const tester = new TextLintTester();
tester.run("prefer-tada-shortcode", rule, {
    valid: ["Release :tada:"],
    invalid: [
        {
            text: "Release 🎉",
            output: "Release :tada:",
            errors: [{ message: "Use :tada: instead of 🎉.", range: [8, 10] }]
        }
    ]
});
```

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

- fixable rule: A rule that reports an error together with its fix
    - **fixable** is **fix**-able.
