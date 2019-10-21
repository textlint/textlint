---
id: rule
title: Creating Rules
---

textlint's AST(Abstract Syntax Tree) is defined at the page.

- [txtnode.md](./txtnode.md)
    - If you want to know AST of a text, use [Online Parsing Demo](./txtnode.md#online-parsing-demo)

Each rules are represented by an object with some properties.
The properties are equivalent to AST node types from TxtNode.

The basic source code format for a rule is:

```js
/**
 * @param {RuleContext} context
 */
export default function(context) {
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
// ES6
export default function(context) {
    return {
        [context.Syntax.Str](node) {
            // this method is called
        }
    };
}
// or ES5
module.exports = function(context) {
    const exports = {};
    exports[context.Syntax.Str] = function(node) {
        // this method is called
    };
    return exports;
};
```

By default, the method matching a node name is called during the traversal when the node is first encountered(This is called **Enter**), on the way down the AST.

You can also specify to visit the node on the other side of the traversal, as it comes back up the tree(This is called **Leave**), but adding `Exit` to the end of the node type, such as:

```js
export default function(context) {
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
- `getConfigBaseDir(): string | undefined` (New in [9.0.0](https://github.com/textlint/textlint/releases/tag/textlint%409.0.0 "9.0.0"))
    - Available [@textlint/get-config-base-dir](https://github.com/textlint/get-config-base-dir "@textlint/get-config-base-dir") polyfill for backward compatibility
    - This method return config base directory path that is the place of `.textlintrc`
    - e.g.) `/path/to/dir/.textlintrc`
    - `getConfigBaseDir()` return `"/path/to/dir/"`.
- `fixer`
    - This is creator object of fix command.
    - See [How to create Fixable Rule?](./rule-fixable.md) for details

## RuleError

RuleError is an object like Error.
Use it with `report` function.

- `RuleError(<message>, [{ line , column }])`
    - e.g.) `new context.RuleError("Found rule error");`
    - e.g.) `new context.RuleError("Found rule error", { line: paddingLine, column: paddingColumn});`
- `RuleError(<message>, [{ index }])`
    - e.g.) `new context.RuleError("Found rule error", { index: paddingIndex });`

```js
// No padding information
const error = new RuleError("message");
//
// OR
// add location-based padding
const paddingLine = 1;
const paddingColumn = 1;
const errorWithPadding = new RuleError("message", {
    line: paddingLine, // padding line number from node.loc.start.line. default: 0
    column: paddingColumn // padding column number from node.loc.start.column. default: 0
});
// context.report(node, errorWithPadding);
//
// OR
// add index-based padding
const paddingIndex = 1;
const errorWithPaddingIndex = new RuleError("message", {
    index: paddingIndex // padding index value from `node.range[0]`. default: 0
});
// context.report(node, errorWithPaddingIndex);
```

### :warning: Caution :warning:

- `index` could **not** used with `line` and `column`.
    - It means that to use `{ line, column }` or `{ index }`
- `index`, `line`, `column` is a **relative** value from the `node` which is reported.

## Report error

You will use mainly method is `context.report()`, which publishes an error (defined in each rules).

For example:

```js
export default function(context) {
    return {
        [context.Syntax.Str](node) {
            // get source code of this `node`
            const text = context.getSource(node);
            if (/found wrong use-case/.test(text)) {
                // report error
                context.report(node, new context.RuleError("Found wrong"));
            }
        }
    };
}
```

### How to write async task in the rule

Return Promise object in the node function and the rule work asynchronously.

```js
export default function(context) {
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
export default function(context) {
    const helper = new RuleHelper(context);
    const { Syntax, getSource, RuleError, report } = context;
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
                        index: match.index
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
                        index: match.index
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
    const parentsTypes = parents.map(function(parent) {
        return parent.type;
    });
    return types.some(function(type) {
        return parentsTypes.some(function(parentType) {
            return parentType === type;
        });
    });
}
/**
 * @param {RuleContext} context
 */
export default function(context) {
    const { Syntax, getSource, RuleError, report } = context;
    return {
        /*
            # Header
            Todo: quick fix this.
        */
        [Syntax.Str](node) {
            // not apply this rule to the node that is child of `Link`, `Image` or `BlockQuote` Node.
            if (isNodeWrapped(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote])) {
                return;
            }
            // get text from node
            const text = getSource(node);
            // does text contain "todo:"?
            const match = text.match(/todo:/i);
            if (match) {
                const todoText = text.substring(match.index);
                report(
                    node,
                    new RuleError(`Found TODO: '${todoText}'`, {
                        // correct position
                        index: match.index
                    })
                );
            }
        },
        /*
            # Header
            - [ ] Todo
        */
        [Syntax.ListItem](node) {
            const text = context.getSource(node);
            const match = text.match(/\[\s+\]\s/i);
            if (match) {
                report(
                    node,
                    new context.RuleError(`Found TODO: '${text}'`, {
                        index: match.index
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
const TextLintTester = require("textlint-tester");
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
        // single match
        {
            text: "TODO: this is TODO",
            errors: [
                {
                    message: "Found TODO: 'TODO: this is TODO'",
                    line: 1,
                    column: 1
                }
            ]
        },
        // multiple match in multiple lines
        {
            text: `TODO: this is TODO
            
- [ ] TODO`,
            errors: [
                {
                    message: "Found TODO: 'TODO: this is TODO'",
                    line: 1,
                    column: 1
                },
                {
                    message: "Found TODO: '- [ ] TODO'",
                    line: 3,
                    column: 3
                }
            ]
        },
        // multiple hit items in a line
        {
            text: "TODO: A TODO: B",
            errors: [
                {
                    message: "Found TODO: 'TODO: A TODO: B'",
                    line: 1,
                    column: 1
                }
            ]
        },
        // exact match or empty
        {
            text: "THIS IS TODO:",
            errors: [
                {
                    message: "Found TODO: 'TODO:'",
                    line: 1,
                    column: 9
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

:information_source: Please see [azu/textlint-rule-no-todo](https://github.com/textlint-rule/textlint-rule-no-todo "azu/textlint-rule-no-todo") for details.

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
export default function(context, options) {
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
export default function(context, options) {
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
  "version": "1.0.1",
  "homepage": "https://github.com/textlint/textlint-custom-rules/",
  "keywords": [
    "textlintrule"
  ]
}
```

### FAQ: Publishing

#### Q. `textlint @ 5.5.x` has new feature. My rule package want to use it.

A. You should

- Add `textlint >= 5.5` to `peerDependencies`
    - See example: [textlint-rule-no-todo/package.json](https://github.com/textlint-rule/textlint-rule-no-todo/blob/50880b4e1c13782874a43714ee69900fc54a5348/package.json)
- Release the rule package as *major* because it has breaking change.

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
