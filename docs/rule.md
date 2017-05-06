# Creating Rules

textlint's AST(Abstract Syntax Tree) is defined these pages.

- [txtnode.d.ts](../typings/txtast.d.ts)
- [txtnode.md](../typings/txtast.d.ts)
    - If you want to know AST of a text, use [Online Parsing Demo](./txtnode.md#online-parsing-demo)

Each rules are represented by a object with some properties.
The properties are equivalent to AST node types from TxtNode.

The basic source code format for a rule is:

```js
/**
 * @param {RuleContext} context
 */
export default function (context) {
    // rule object
    return {
        [context.Syntax.Document](node) {
        },
        
        [context.Syntax.Paragraph](node) {
        },
        
        [context.Syntax.Str](node) {
            const text = context.getSource(node);
            if(/found wrong use-case/.test(text)){
                // report error
                context.report(node, new context.RuleError("Found wrong"));
            }
        },
        
        [context.Syntax.Break](node) {
        }
    };
}
```

If your rule wants to know when an `Str` node is found in the AST, then add a method called `context.Syntax.Str`, such as:

```js
// ES6
export default function (context) {
    return {
        [context.Syntax.Str](node) {
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

You can also specify to visit the node on the other side of the traversal, as it comes back up the tree(This is called **Leave**), but adding `:exit` to the end of the node type, such as:


```js
export default function (context) {
    return {
        // Str:exit
        [`${context.Syntax.Str}:exit`](node) {
            // this method is called
        }
    };
}
```

[visualize-txt-traverse](https://github.com/azu/visualize-txt-traverse "azu/visualize-txt-traverse") help you better understand this traversing.

[![gif visualize-txt-traverse](http://gyazo.com/155c68f0f9ff35e0a549d655a787c01e.gif)](https://github.com/azu/visualize-txt-traverse "azu/visualize-txt-traverse")

[AST explorer for textlint](https://textlint.github.io/astexplorer/ "AST explorer for textlint") help you better understand [TxtAST](./txtnode.md).

[![ast-explorer fork](./resources/ast-explorer.png)](https://textlint.github.io/astexplorer/)


**Related information:**

- [azu/visualize-txt-traverse](https://github.com/azu/visualize-txt-traverse "azu/visualize-txt-traverse")
- [textlint/txt-ast-traverse](https://github.com/textlint/txt-ast-traverse "textlint/txt-ast-traverse")
- [estools/estraverse](https://github.com/estools/estraverse "estools/estraverse")

## RuleContext

RuleContext object has following property:

- `Syntax.*` is const values of [TxtNode type](./txtnode.md).
    - e.g.) `context.Syntax.Str`
    - [src/shared/type/NodeType.js](../src/shared/type/NodeType.js)
- `report(<node>, <ruleError>)` is a method that reports a message from one of the rules.
    - e.g.) `context.report(node, new context.RuleError("found rule error"));`
- `getSource(<node>)`  is a method gets the source code for the given node.
    - e.g.) `context.getSource(node); // => "text"`
- `getFilePath()` return file path that is linting target.
    - e.g.) `context.getFilePath(): // => /path/to/file.md or undefined` 
- `fixer` is creator of fix command.
    - See [How to create Fixable Rule?](./rule-fixer.md) for details

## RuleError

RuleError is a object like Error.
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

You will use mainly method is `context.report()`, which publishes a error (defined in each rules).

For example:

```js
export default function (context) {
    return {
        [context.Syntax.Str](node) {
            // get source code of this `node`
            const text = context.getSource(node);
            if(/found wrong use-case/.test(text)){
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
export default function (context) {
    const {Syntax} = context;
    return {
        [Syntax.Str](node){
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

You can setup textlint rule by following steps:

```sh
npm install create-textlint-rule -g
# Install `create-textlint-rule` command
create-textlint-rule no-todo
# Create `textlint-rule-no-todo` project and setup!
# rm src/index.js test/index-tes.js
```

This generated project contains [textlint-scripts](https://github.com/textlint/textlint-scripts "textlint-scripts") that provide build script and test script.

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
    const helper = new RuleHelper(context);
    const {Syntax, getSource, RuleError, report} = context;
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
                report(node, new RuleError(`Found TODO: '${text}'`, {
                    index: match.index
                }));
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
                report(node, new context.RuleError(`Found TODO: '${text}'`, {
                    index: match.index
                }));
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

![result error](http://monosnap.com/image/9FeIQr95kXjGPWFjZFRq6ZFG16YscF.png)

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
/**
 * @param {RuleContext} context
 */
export default function (context) {
    const {Syntax, getSource, RuleError, report} = context;
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
                report(node, new RuleError(`Found TODO: '${todoText}'`, {
                    // correct position
                    index: match.index
                }));
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
                report(node, new context.RuleError(`Found TODO: '${text}'`, {
                    index: match.index
                }));
            }
        }
    };
}
```

As as result, linting following text with modified rule, a result was no error.

```markdown
[todo:image](http://example.com)
```

- The created rule is [textlint-rule-no-todo](https://github.com/azu/textlint-rule-no-todo "azu/textlint-rule-no-todo").
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

:information_source: Please see [azu/textlint-rule-no-todo](https://github.com/azu/textlint-rule-no-todo "azu/textlint-rule-no-todo") for details.

### Rule Config

`.textlintrc` is the config file for textlint.

For example, there are a config file:

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
export default function(context, options){
    console.log(options);
    /*
        {
          "key": "value"
        }
    */
}
```

## Advanced example

If you want to know more details, please see other example.

- [Paragraph rule](./rule-advanced.md)

## Information for Publishing

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


## Package Naming conventions

textlint's rule should use `textlint-rule-` prefix.

e.g.) `textlint-rule-no-todo`

textlint user use it following:

```json
{
    "rules": {
        "no-todo": true
    }
}
```

The rule naming conventions for textlint are simple:

- If your rule is disallowing something, prefix it with `no-`.
    - For example, `no-todo` disallowing `TODO:` and `no-exclamation-question-mark` for disallowing `!` and `?`.
- If your rule is enforcing the inclusion of something, use a short name without a special prefix.
    - If the rule for english, please uf `textlint-rule-en-` prefix.
- Keep your rule names as short as possible, use abbreviations where appropriate.
- Use dashes(`-`) between words.

npm info:

- [package.json | npm Documentation](https://docs.npmjs.com/files/package.json "package.json | npm Documentation")
- [results for textlint](https://www.npmjs.com/search?q=textlint "results for textlint")

Example rules:

- [azu/textlint-rule-no-todo](https://github.com/azu/textlint-rule-no-todo "azu/textlint-rule-no-todo")
- [Collection of textlint rule · textlint/textlint Wiki](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule "Collection of textlint rule · textlint/textlint Wiki")

Reference

- [Working with Rules - ESLint - Pluggable JavaScript linter](http://eslint.org/docs/developer-guide/working-with-rules#rule-naming-conventions "Working with Rules - ESLint - Pluggable JavaScript linter")

### FAQ: Publishing

#### Q. `textlint @ 5.5.x` has new feature. My rule module want to use it.

A. You should

- Add `textlint >= 5.5` to `peerDependencies`
    - See example: [textlint-rule-no-todo/package.json](https://github.com/azu/textlint-rule-no-todo/blob/50880b4e1c13782874a43714ee69900fc54a5348/package.json#L47-L49)
- Release the rule module as *major* because it has breaking change.

#### Q. `textlint` does major update. Do my rule module major update?

A. If the update contain breaking change, should update as *major*.
if not, update as *major* or *minor*.

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
