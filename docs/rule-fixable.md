# Creating fixable rule

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

**fixer** does lint and found error

If you'd like textlint to attempt to fix the problem you're reporting, you can do so by specifying the fix object when using `context.report()`.
The fixer object, that you can use to apply a fix. For example:

The fixer object has the following methods:

```js
// TODO: more reasonable example
const reporter = context => {
    // `context.fixer`
    const { Syntax, RuleError, fixer, report, getSource } = context;
    return {
        [Syntax.Str](node) {
            const text = getSource(node);
            // "You fix this"
            //      ^^^
            const matchRegexp = /\bfix\b/;
            if (!matchRegexp.test(text)) {
                return;
            }
            // found "fixable" error
            const index = text.search(matchRegexp);
            const length = "fix".length;
            const replace = fixer.replaceTextRange([index, index + length], "fixed");
            report(
                node,
                new RuleError("Replaced", {
                    // "You fix this"
                    //      ^ index
                    index,
                    // "You fix this"
                    //      ^^^
                    //     fixed
                    fix: replace
                })
            );
        }
    };
};
export default {
    linter: reporter,
    // This rule has fixer.
    fixer: reporter
};


```

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

[![textlint rule](https://img.shields.io/badge/textlint-fixable-green.svg?style=social)](https://textlint.github.io/) 

```markdown
[![textlint rule](https://img.shields.io/badge/textlint-fixable-green.svg?style=social)](https://textlint.github.io/) 
```

## Terms

- fixble rule: A rule report error that could be fixed
    - **fixable** is **fix**-able.
