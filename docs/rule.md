---
id: rule
title: Creating Rules
---

textlint's AST(Abstract Syntax Tree) is defined at the page.

- [txtnode.md](./txtnode.md)
    - If you want to know AST of a text, use [Online Parsing Demo](./txtnode.md#online-parsing-demo)

Each rule are represented by an object with some properties.
The properties are equivalent to AST node types from TxtNode.

The basic source code format for a rule is:

```js
/**
 * @param {RuleContext} context
 */
export default function (context) {
    // rule object
    return {
        [context.Syntax.Document](node) {},

        [context.Syntax.Paragraph](node) {},

        [context.Syntax.Str](node) {
            const text = context.getSource(node);
            if (/found wrong use-case/.test(text)) {
                // report error
                context.report(node, new context.RuleError("Found wrong"));
            }
        },

        [context.Syntax.Break](node) {}
    };
}
```

If your rule wants to know when an `Str` node is found in the AST, then add a method called `context.Syntax.Str`, such as:

```js
// ES2015+
export default function (context) {
    const { Syntax } = context;
    return {
        [Syntax.Str](node) {
            // this method is called
        }
    };
}
// or ES5
module.exports = function (context) {
    const exports = {};
    exports[context.Syntax.Str] = function (node) {
        // this method is called
    };
    return exports;
};
```

By default, the method matching a node name is called during the traversal when the node is first encountered(This is called **Enter**), on the way down the AST.

You can also specify to visit the node on the other side of the traversal, as it comes back up the tree(This is called **Leave**), but adding `Exit` to the end of the node type, such as:

```js
export default function (context) {
    return {
        // Str:exit
        [context.Syntax.StrExit](node) {
            // this method is called
        }
    };
}
```

Note: textlint@11.1.1+ support `*Exit` constant value like `Syntax.DocumentExit`.
In textlint@11.1.0<=, you had to write `[Syntax.Document + ":exit"]`.

[visualize-txt-traverse](https://github.com/azu/visualize-txt-traverse "azu/visualize-txt-traverse") help you better understand this traversing.

[![gif visualize-txt-traverse](https://gyazo.com/155c68f0f9ff35e0a549d655a787c01e.gif)](https://github.com/azu/visualize-txt-traverse "azu/visualize-txt-traverse")

[AST explorer for textlint](https://textlint.github.io/astexplorer/ "AST explorer for textlint") help you better understand [TxtAST](./txtnode.md).

[![ast-explorer fork](assets/ast-explorer.png)](https://textlint.github.io/astexplorer/)


**Related information:**

- [azu/visualize-txt-traverse](https://github.com/azu/visualize-txt-traverse "azu/visualize-txt-traverse")
- [packages/@textlint/ast-traverse](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-traverse "packages/@textlint/ast-traverse")
- [estools/estraverse](https://github.com/estools/estraverse "estools/estraverse")

## RuleContext API

RuleContext object has following property:

- `Syntax.*` 
    - This is const values of [TxtNode type](./txtnode.md).
    - e.g.) `context.Syntax.Str`
    - [packages/@textlint/ast-node-types/src/index.ts](https://github.com/textlint/textlint/blob/master/packages/%40textlint/ast-node-types/src/index.ts)
- `report(<node>, <ruleError>): void`
    - This method is a method that reports a message from one of the rules.
    - e.g.) `context.report(node, new context.RuleError("found rule error"));`
- `getSource(<node>): string`
    - This method is a method gets the source code for the given node.
    - e.g.) `context.getSource(node); // => "text"`
- `getFilePath(): string | undefined`
    - This method return file path that is linting target.
    - e.g.) `context.getFilePath(): // => /path/to/file.md or undefined` 
- `getConfigBaseDir(): string | undefined`
    - New in [9.0.0](https://github.com/textlint/textlint/releases/tag/textlint%409.0.0 "9.0.0")
    - Available [@textlint/get-config-base-dir](https://github.com/textlint/get-config-base-dir "@textlint/get-config-base-dir") polyfill for backward compatibility
    - This method return config base directory path that is the place of `.textlintrc`
    - e.g.) `/path/to/dir/.textlintrc`
    - `getConfigBaseDir()` return `"/path/to/dir/"`.
- `fixer`
    - This is creator object of fix command.
    - See [How to create Fixable Rule?](./rule-fixable.md) for more details
- `locator`
    - New in [12.2.0](https://github.com/textlint/textlint/releases/tag/v12.2.0)
    - This utility provide range methods for `padding` property to `RuleError`
    - See [RuleError](#RuleError) for more details

## RuleError

`RuleError` is an Error object for reporting.
Use it with `report` function.

- `report(node, new RuleError(<message>))`
  - report new error
  - textlint show the `<mesage>` against `node`'s range. 
- `report(node, new RuleError(<message>, { padding }))`
  - report new error with `padding`.
  - textlint show the `<mesage>` against `node`'s range + `padding`.
  - You can control correct error range by `padding` property of `RuleError`

Example: report the `Str` node that is typo.

```
This is typo.
^^^^^^^^^^^^^
      |
  Found a typo.
```

```js
export default function (context) {
    const { Syntax, report, RuleError, getSource } = context;
    return {
        [Syntax.Str](node) {
            // get source code of this `node`
            const text = getSource(node);
            if (/typo/.test(text)) {
                // report error
                report(node, new RuleError("Found a typo"));
            }
        }
    };
}
```

Example: report `typo` string that is typo using `padding`

```
This is typo.
        ^^^^
          |
        Found a typo.
```

```js
export default function (context) {
    const { Syntax, report, RuleError, getSource, locator } = context;
    return {
        [Syntax.Str](node) {
            // get source code of this `node`
            const text = getSource(node);
            const match = text.match(/typo/);
            if (match) {
                // report error with padding
                // node's start + padding's range
                // As a result, report the error that is [node.range[0] + typo.index, node.range[1] + typo.index + type.length]
                report(
                    node,
                    new RuleError("Found a typo", {
                        padding: locator.range([match.index, match.index + match[0].length])
                    })
                );
            }
        }
    };
}
```

The `context.locator` object has the following methods:

-`locator.at(index)` - return padding value that is relative index from node's start index.
  - The `index` value is 0-based value
  - This method is alias to `locator.range([index, index + 1])`
-`locator.range([startIndex, endIndex])` - return padding value that is relative range from node's start index
  - Each `index` value is 0-based value
-`locator.loc({ start: { line, column }, end: { line, column })` - return padding value that is relative location from node's start loc
  - :memo: This `line` and `column` is relative value. It is not absolute value. So, These are 0-based value.
  
```ts
export type TextlintRulePaddingLocator = {
    /**
     * at's index is 0-based value.
     * It is alias to `range([index, index + 1])`
     * @param index relative index from node's start position
     */
    at(index: number): TextlintRuleErrorPaddingLocation;
    /**
     * range's index is 0-based value
     * @param range relative range from node's start position
     */
    range(range: readonly [startIndex: number, endIndex: number]): TextlintRuleErrorPaddingLocation;
    /**
     * line is relative padding value from node's start position
     * column is relative padding value from node's start position
     * @param location relative location from node's start position
     */
    loc(location: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    }): TextlintRuleErrorPaddingLocation;
};
```

Examples

```ts
// locator.at
report(node, new RuleError(message, {
  padding: locator.at(11)
}));
// locator.range
report(node, new RuleError(message, {
  padding: locator.range([5, 10])
}));
// locator.loc
report(node, new RuleError(message, {
  padding: locator.loc({
      start: {
          line: 1,
          column: 1
      },
      end: {
          line: 2,
          column: 2
      }
  })
}));
```

:memo: `padding` option and `locator` object are introduced in textlint v12.2.0+.
You can declare your dependency on textlint in `package.json` using the [peerDependencies](https://docs.npmjs.com/files/package.json#peerdependencies) field.

```json5
  "peerDependencies": {
    "textlint": ">= 12.2.0"
  }
```

<details>
<summary>Deprecated: { line, column } and { index } properties</summary>

`{ line, column }` and `{ index }` properties are deprecated.
Instead of these, textlint v12.2.0 introduce `padding` property and `locator` object.

Deprecated way:

```js
// report without padding
const error = new RuleError("message");
// OR
// report with location-based padding
const paddingLine = 1;
const paddingColumn = 1;
const errorWithPadding = new RuleError("message", {
    line: paddingLine, // padding line number from node.loc.start.line. default: 0
    column: paddingColumn // padding column number from node.loc.start.column. default: 0
});
// OR
// report with index-based padding
const paddingIndex = 1;
const errorWithPaddingIndex = new RuleError("message", {
    index: paddingIndex // padding index value from `node.range[0]`. default: 0
});
```

Current way:

```js
// No padding information
// It means, this error point out the whole node
const error = new RuleError("message");
// OR
const errorWithPadding = new RuleError("message", {
    padding: locator.loc({
        start: {
            line: 1, // padding line number from node.loc.start.line. default: 0
            column: 1 // padding column number from node.loc.start.column. default: 0
        },
        end: {
            line: 1, // padding line number from node.loc.start.line. default: 0
            column: 2 // padding column number from node.loc.start.column. default: 0
        }
    })
});
// OR
const paddingIndex = 1;
const errorWithPaddingIndex = new RuleError("message", {
    // padding [startIndex, endIndex] from node's start index.
    padding: locator.range([1, 2])
});
```

</details>

### :warning: Caution :warning:

- `index` could **not** used with `line` and `column`.
    - It means that to use `{ line, column }` or `{ index }`
- `index`, `line`, `column` is a **relative** value from the `node` which is reported.

## Report error

You will use mainly method is `context.report()`, which publishes an error (defined in each rules).

For example:

```js
export default function (context) {
    const { Syntax, report, RuleError } = context;
    return {
        [Syntax.Str](node) {
            // get source code of this `node`
            const text = context.getSource(node);
            if (/found wrong use-case/.test(text)) {
                // report error
                report(node, new RuleError("Found wrong"));
            }
        }
    };
}
```

### How to write async task in the rule

Return Promise object in the node function and the rule work asynchronously.

```js
export default function (context) {
    const { Syntax } = context;
    return {
        [Syntax.Str](node) {
            // textlint wait for resolved the promise.
            return new Promise((resolve, reject) => {
                // async task
            });
        }
    };
}
```

## Example: creating `no-todo` rules.

This example aim to create `no-todo` rule that throw error if the text includes `- [ ]` or `todo:`.

### Setup for creating rule

textlint prepare useful generator tool that is [create-textlint-rule](https://github.com/textlint/create-textlint-rule) command.

- [textlint/create-textlint-rule: Create textlint rule project with no configuration.](https://github.com/textlint/create-textlint-rule)
- [textlint/textlint-scripts: textlint npm-run-scripts CLI help to create textlint rule.](https://github.com/textlint/textlint-scripts)

You can setup textlint rule using [npx](https://github.com/npm/npx) that is included in `npm`:

```sh
# Create `textlint-rule-no-todo` project and setup!
npx create-textlint-rule no-todo
```

Or use `npm install` command:

```sh
# Install `create-textlint-rule` to global
npm install --global create-textlint-rule 
# Create `textlint-rule-no-todo` project and setup!
create-textlint-rule no-todo
```

This generated project contains [textlint-scripts](https://github.com/textlint/textlint-scripts) that provide build script and test script.

:memo: If you want to write TypeScript, Pass `--typescript` flag to [create-textlint-rule](https://github.com/textlint/create-textlint-rule).
For more details, see [create-textlint-rule](https://github.com/textlint/create-textlint-rule)'s README.

#### Build

Builds source codes for publish to the `lib/` folder.
You can write ES2015+ source codes in `src/` folder.
The source codes in `src/` built by following command.

    npm run build

#### Tests

Run test code in `test/` folder.
Test textlint rule by [textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester").

    npm test

### Let's create `no-todo` rule

File Name: `no-todo.js`

```js
/**
 * @param {RuleContext} context
 */
export default function (context) {
    const { Syntax, getSource, RuleError, report, locator } = context;
    return {
        /*
            # Header
            Todo: quick fix this.
            ^^^^^
            Hit!
        */
        [Syntax.Str](node) {
            // get text from node
            const text = getSource(node);
            // does text contain "todo:"?
            const match = text.match(/todo:/i);
            if (match) {
                report(
                    node,
                    new RuleError(`Found TODO: '${text}'`, {
                        padding: locator.range([match.index, match.index + text.length])
                    })
                );
            }
        },
        /*
            # Header
            - [ ] Todo
              ^^^
              Hit!
        */
        [Syntax.ListItem](node) {
            const text = context.getSource(node);
            const match = text.match(/\[\s+\]\s/i);
            if (match) {
                report(
                    node,
                    new context.RuleError(`Found TODO: '${text}'`, {
                        padding: locator.range([match.index, match.index + text.length])
                    })
                );
            }
        }
    };
}
```

Example text:

```markdown
# Header

this is Str.

Todo: quick fix this.

- list 1
- [ ] todo
```

Run Lint!

```sh
$ npm run build
$ textlint --rulesdir lib/ README.md -f pretty-error
```

![result error](https://monosnap.com/image/9FeIQr95kXjGPWFjZFRq6ZFG16YscF.png)

### Advanced rules

When linting following text with above `no-todo` rule, a result was error.

```markdown
[todo:image](http://example.com)
```

#### Case: ignore child node of `Link`, `Image` or `BlockQuote`.

You want to ignore this case, and write the following:

```js
/**
 * Get parents of node.
 * The parent nodes are returned in order from the closest parent to the outer ones.
 * @param node
 * @returns {Array}
 */
function getParents(node) {
    const result = [];
    // child node has `parent` property.
    let parent = node.parent;
    while (parent != null) {
        result.push(parent);
        parent = parent.parent;
    }
    return result;
}
/**
 * Return true if `node` is wrapped any one of `types`.
 * @param {TxtNode} node is target node
 * @param {string[]} types are wrapped target node
 * @returns {boolean|*}
 */
function isNodeWrapped(node, types) {
    const parents = getParents(node);
    const parentsTypes = parents.map(function (parent) {
        return parent.type;
    });
    return types.some(function (type) {
        return parentsTypes.some(function (parentType) {
            return parentType === type;
        });
    });
}
export default function (context) {
    const { Syntax, getSource, RuleError, report, locator } = context;
    return {
        /*
        Todo: quick fix this.
    */
        [Syntax.Str](node) {
            // Ignore the node if the node is child of some Node types
            if (isNodeWrapped(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote])) {
                return;
            }
            // get text from node
            const text = getSource(node);
            // Does the text contain "todo:"?
            const matches = text.matchAll(/todo:/gi);
            for (const match of matches) {
                const index = match.index ?? 0;
                const length = match[0].length;
                report(
                    node,
                    new RuleError(`Found TODO: '${text}'`, {
                        padding: locator.range([index, index + length])
                    })
                );
            }
        },
        /*
        - [ ] Todo
    */
        [Syntax.ListItem](node) {
            const text = context.getSource(node);
            // Does the ListItem's text starts with `- [ ]`
            const match = text.match(/^-\s\[\s+]\s/i);
            if (match && match.index !== undefined) {
                report(
                    node,
                    new context.RuleError(`Found TODO: '${text}'`, {
                        padding: locator.range([match.index, match.index + match[0].length])
                    })
                );
            }
        }
    };
}
```

As a result, linting following text with modified rule, a result was no error.

```markdown
[todo:image](http://example.com)
```

- The created rule is [textlint-rule-no-todo](https://github.com/textlint-rule/textlint-rule-no-todo "azu/textlint-rule-no-todo").
- These helper functions like `getParents` are implemented in [textlint/textlint-rule-helper](https://github.com/textlint/textlint-rule-helper "textlint/textlint-rule-helper").

### How to test the rule?

You can already run test by `npm test` command.
(This test scripts is setup by `create-textlint-rule`)

This test script use [textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester").

-----

### Manually Installation

[textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester") depend on [Mocha](https://mochajs.org/ "Mocha").

    npm install -D textlint-tester mocha

-----

#### Usage of textlint-tester 

1. Write tests by using textlint-tester
2. Run tests by Mocha

`test/textlint-rule-no-todo-test.js`:

```js
import TextLintTester from "textlint-tester";
const tester = new TextLintTester();
// rule
import rule from "../src/no-todo";
// ruleName, rule, { valid, invalid }
tester.run("no-todo", rule, {
    valid: [
        // no match
        "text",
        // partial match
        "TODOS:",
        // ignore node's type
        "[TODO: this is todo](http://example.com)",
        "![TODO: this is todo](http://example.com/img)",
        "> TODO: this is todo"
    ],
    invalid: [
        // range
        {
            text: "- [ ] string",
            //     ^^^^^^
            errors: [
                {
                    message: "Found TODO: '- [ ] string'",
                    range: [0, 6]
                }
            ]
        },
        // loc
        {
            text: "- [ ] string",
            //     ^^^^^^
            errors: [
                {
                    message: "Found TODO: '- [ ] string'",
                    loc: {
                        start: {
                            line: 1,
                            column: 1
                        },
                        end: {
                            line: 1,
                            column: 7
                        }
                    }
                }
            ]
        }
    ]
});
```

Run the tests:

    $ npm test
    # or
    $(npm bin)/mocha test/

:information_source: Please see [textlint-rule-no-todo](https://github.com/textlint-rule/textlint-rule-no-todo) for details.

### Rule options

`.textlintrc` is the config file for textlint.

For example, `very-nice-rule`'s option is `{ "key": "value" }` in `.textlintrc`

```json
{
  "rules": {
    "very-nice-rule": {
      "key": "value"
    }
  }
}
```

`very-nice-rule.js` rule get the options defined by the config file.

```js
export default function (context, options) {
    console.log(options);
    /*
        {
          "key": "value"
        }
    */
}
```

The `options` value is `{}` (empty object) by default.

For example, `very-nice-rule`'s option is `true` (enable the rule) in `.textlintrc`

```json
{
  "rules": {
    "very-nice-rule": true
  }
}
```

`very-nice-rule.js` rule get `{}` (empty object) as `options`.

```js
export default function (context, options) {
    console.log(options); // {}
}
```

**History**: This behavior is changed in textlint@11.

- <https://github.com/textlint/textlint/issues/535>

## Advanced example

If you want to know more details, please see other example.

- [Paragraph rule](./rule-advanced.md)

## Publishing

If you want to publish your textlint rule, see following documents.

### Package Naming Conventions

textlint rule package naming should have `textlint-rule-` prefix.
 
- `textlint-rule-<name>`
- `@scope/textlint-rule-<name>`
    - textlint supports [Scoped packages](https://docs.npmjs.com/misc/scope "Scoped packages")

Example: `textlint-rule-no-todo`

textlint user use it following:

```json
{
    "rules": {
        "no-todo": true
    }
}
```

Example: `@scope/textlint-rule-awesome`

textlint user use it following:

```json
{
    "rules": {
        "@scope/awesome": true
    }
}
```

### Rule Naming Conventions

The rule naming conventions for textlint are simple:

- If your rule is disallowing something, prefix it with `no-`.
    - For example, `no-todo` disallowing `TODO:` and `no-exclamation-question-mark` for disallowing `!` and `?`.
- If your rule is enforcing the inclusion of something, use a short name without a special prefix.
    - If the rule for english, please uf `textlint-rule-en-` prefix.
- Keep your rule names as short as possible, use abbreviations where appropriate.
- Use dashes(`-`) between words.

npm information:

- [package.json | npm Documentation](https://docs.npmjs.com/files/package.json "package.json | npm Documentation")
- [results for textlint](https://www.npmjs.com/search?q=textlint "results for textlint")

Example rules:

- [Collection of textlint rule · textlint/textlint Wiki](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule "Collection of textlint rule · textlint/textlint Wiki")

### Keywords

You should add `textlintrule` to npm's `keywords`

```json
{
  "name": "textlint-rule-no-todo",
  "description": "Your custom rules description",
  "version": "1.0.0",
  "homepage": "https://github.com/textlint/textlint-custom-rules/",
  "keywords": [
    "textlintrule"
  ]
}
```

### FAQ: Publishing

#### Q. `textlint @ x.y.z` has new feature. My rule package require it

A. You should add `textlint >= x.y.z` to `peerDependencies` in `package.json`

The recommended way to declare a dependency for future-proof compatibility is with the `">="` range syntax, using the lowest required eslint version. For example:

```json5
  "peerDependencies": {
    "textlint": ">= 5.5.0"
  }
```

See example: [textlint-rule-no-todo/package.json](https://github.com/textlint-rule/textlint-rule-no-todo/blob/50880b4e1c13782874a43714ee69900fc54a5348/package.json)

#### Q. `textlint` does major update. Do my rule package major update?

A. If the update contains a breaking change on your rule, should update as *major*.
If the update **does not** contain a breaking change on your rule, update as *minor*.

## Performance

### Rule Performance

textlint has a built-in method to track performance of individual rules.
Setting the `TIMING=1` environment variable will trigger the display.
It show their individual running time and relative performance impact as a percentage of total rule processing time.

```
$ TIMING=1 textlint README.md
Rule                            | Time (ms) | Relative
:-------------------------------|----------:|--------:
spellcheck-tech-word            |   124.277 |    70.7%
prh                             |    18.419 |    10.5%
no-mix-dearu-desumasu           |    13.965 |     7.9%
max-ten                         |    13.246 |     7.5%
no-start-duplicated-conjunction |     5.911 |     3.4%
```


## Implementation Node :memo:

textlint ignore duplicated message/rules by default.

- If already the rule with config is loaded, Don't load this(same rule with same config).
    - [Proposal: don't load duplicated rule(ruleConfig) · Issue #219 · textlint/textlint](https://github.com/textlint/textlint/issues/219 "Proposal: don&#39;t load duplicated rule(ruleConfig) · Issue #219 · textlint/textlint")
- Duplicated error message is ignored by default
    - _Duplicated error messages_ is that have same range and same message.
    - [Proposal: duplicated messages is ignored by default · Issue #209 · textlint/textlint](https://github.com/textlint/textlint/issues/209 "Proposal: duplicated messages is ignored by default · Issue #209 · textlint/textlint")
