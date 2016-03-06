# Creating Rules

Textlint's AST(Abstract Syntax Tree) is defined these pages.

- [txtnode.d.ts](./txtnode.d.ts)
- [txtnode.md](./txtnode.md)
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
            var text = context.getSource(node);
            if(/found wrong use-case/.test(text)){
                // report error
                context.report(node, new context.RuleError("found wrong"));
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
        [context.Syntax.Str] = function (node) {
            // this method is called
        }
    };
}
// or ES5
module.exports = function (context) {
    var exports = {};
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

![gif visualize-txt-traverse](http://gyazo.com/155c68f0f9ff35e0a549d655a787c01e.gif)

**related information:**

- [azu/visualize-txt-traverse](https://github.com/azu/visualize-txt-traverse "azu/visualize-txt-traverse")
- [textlint/txt-ast-traverse](https://github.com/textlint/txt-ast-traverse "textlint/txt-ast-traverse")
- [estools/estraverse](https://github.com/estools/estraverse "estools/estraverse")

## RuleContext

RuleContext object has following property:

- `Syntax.*` is const values of [TxtNode type](./txtnode.md).
    - e.g.) `context.Syntax.Str`
    - [lib/parser/union-syntax.js](../lib/parser/union-syntax.js)
- `report(<node>, <ruleError>)` is a method reports a message from one of the rules.
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
    - e.g.) `new context.RuleError("Found rule error")`

```js
var error = new RuleError("message");
// 
// OR
// location-based error
var paddingLine = 1;
var paddingColumn = 1;
var errorWithPadding = new RuleError("message", {
    line: paddingLine, // padding line number from node.loc.start.line. default: 0
    column: paddingColumn // padding column number from node.loc.start.column. default: 0
});
// context.report(node, errorWithPadding);
//
// OR
// index-based error
var paddingIndex = 1;
var errorWithPaddingIndex = new RuleError("message", {
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
        [context.Syntax.Str] = function (node) {
            // get source code of this `node`
            var text = context.getSource(node);
            if(/found wrong use-case/.test(text)){
                // report error
                context.report(node, new context.RuleError("found wrong"));
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

This example aim to found `- [ ]` and `todo:` texts.

Rule file name is equal to rule ID.

e.g.) no-todo.js for rule ID no-todo.

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
        */
        [Syntax.ListItem](node) {
            var text = context.getSource(node);
            var match = text.match(/\[\s+\]\s/i);
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
$ textlint README.md -f pretty-error
```

OR

```sh
$ textlint README.md --rulesdir path/to/rules/ -f pretty-error
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
    var result = [];
    // child node has `parent` property.
    var parent = node.parent;
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
    var parents = getParents(node);
    var parentsTypes = parents.map(function (parent) {
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
            var text = getSource(node);
            // does text contain "todo:"?
            if (/todo:/i.test(text)) {
                report(node, new RuleError("found TODO: '" + text + "'"));
            }
        },
        /*
            # Header
            - [ ] Todo
        */
        [Syntax.ListItem](node) {
            var text = getSource(node);
            if (/\[\s+\]\s/i.test(text)) {
                report(node, new RuleError("found TODO: '" + text + "'"));
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


## Information for Publishing

You should add `textlint` to npm's `keywords`

```json
{
  "name": "textlint-rule-no-todo",
  "description": "Your custom rules description",
  "version": "1.0.1",
  "homepage": "https://github.com/textlint/textlint-custom-rules/",
  "keywords": [
    "textlint"
  ]
}
```

We recommend that plugin's name should start with `textlint-rule-*`.

e.g.) textlint-rule-no-todo

npm info:

- [package.json | npm Documentation](https://docs.npmjs.com/files/package.json "package.json | npm Documentation")
- [results for textlint](https://www.npmjs.com/search?q=textlint "results for textlint")

Example rules:

- [azu/textlint-rule-no-todo](https://github.com/azu/textlint-rule-no-todo "azu/textlint-rule-no-todo")
- [azu/textlint-rule-spellcheck-tech-word](https://github.com/azu/textlint-rule-spellcheck-tech-word "azu/textlint-rule-spellcheck-tech-word")

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
