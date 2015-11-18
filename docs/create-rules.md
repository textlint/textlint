# Creating Rules

Textlint's AST(Abstract Syntax Tree) is defined these pages.

- [txtnode.d.ts](./txtnode.d.ts)
- [txtnode.md](./txtnode.md)
    - If you want to know AST of a text, use [Online Parsing Demo](./txtnode.md#online-parsing-demo)

Each rules are represented by a object with several properties.
The properties are equivalent to AST node types from TxtNode.

The basic source code format for a rule is:

```js
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    // rule object
    var exports = {};
    exports[context.Syntax.Document] = function (node) {
    };
    exports[context.Syntax.Paragraph] = function (node) {
    };
    exports[context.Syntax.Str] = function (node) {
        var text = context.getSource(node);
        if(/found wrong use-case/.test.(text){
            // report error
            context.report(node, new context.RuleError("found wrong"));
        }
    };
    exports[context.Syntax.Break] = function (node) {
    };
    return exports;
};
```

If your rule wants to know when an `Str` node is found in the AST, then add a method called `context.Syntax.Str`, such as:

```js
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
module.exports = function (context) {
    var exports = {};
    exports[context.Syntax.Str + ":exit"] = function (node) {
        // this method is called
    };
    return exports;
};
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
- `RuleError(<message>)` is like Error object.
    - e.g.) `new context.RuleError("found rule error")`
- `report(<node>, <ruleError>)` is a method reports a message from one of the rules.
    - e.g.) `context.report(node, new context.RuleError("found rule error"));`
- `getSource(<node>)`  is a method gets the source code for the given node.
    - e.g.) `context.getSource(node); // => "text"`
- `getFilePath()` return file path that is linting target.
    - e.g.) `context.getFilePath(): // => /path/to/file.md or undefined` 

See also [Working with Rules](http://eslint.org/docs/developer-guide/working-with-rules.html "Working with Rules") on ESLint.

## Report error

You will use mainly method is `context.report()`, which publishes a error (defined in each rules).

For example:

```js
module.exports = function (context) {
    var exports = {};
    exports[context.Syntax.Str] = function (node) {
        // get source code of this `node`
        var text = context.getSource(node);
        if(/found wrong use-case/.test.(text){
            // report error
            context.report(node, new context.RuleError("found wrong"));
        }
    };
    return exports;
};
```

### How to write async task in the rule

Return Promise object in the node function and the rule work asynchronously.

```js
export default function (context) {
    return {
        [Syntax.Str](node){
            // textlint wait for resolved the promise.
            return new Promise((resolve, reject) => {
                // async task
            });
        }
    }
}
```

## Example: creating `no-todo` rules.

This example aim to found `- [ ]` and `todo:` texts.

Rule file name is equal to rule ID(i.e., no-todo.js for rule ID no-todo).

File Name: `no-todo.js`

```js
"use strict"
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    // When `node`'s type is `Str` come, call this callback.
    /*
    e.g.)
        # Header

        this is Str.

        Todo: quick fix this.
    */
    // `Str` is "this is Str." and "Todo: quick fix this.", so called this callback twice.
    exports[context.Syntax.Str] = function (node) {
        // get text from node
        var text = context.getSource(node);
        // does text contain "todo:"?
        if (/todo:/i.test(text)) {
            context.report(node, new context.RuleError("found Todo: " + text));
        }
    };
    // When `node`'s type is `ListItem` come, call this callback.
    /*
    e.g.)
        # Header

        - list 1
        - [ ] todo
    */
    // `List` is "- list 1" and - [ ] todo", so called this callback twice.
    exports[context.Syntax.ListItem] = function (node) {
        var text = context.getSource(node);
        if (/\[\s+\]\s/i.test(text)) {
            context.report(node, new context.RuleError("found Todo: " + text));
        }
    };
    return exports;
};

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
module.exports = function (context) {
    var exports = {};
    // When `Node`'s type is `Str` come, call this callback.
    /*
    e.g.)
        - [ ] TODO
        
    Exception) [todo:text](http://example.com)
    */
    exports[context.Syntax.Str] = function (node) {
        var Syntax = context.Syntax;
        // not apply this rule to the node that is child of `Link`, `Image` or `BlockQuote` Node.
        if (isNodeWrapped(node, [Syntax.Link, Syntax.Image, Syntax.BlockQuote])) {
            return;
        }
        var text = context.getSource(node);
        if (/todo:/i.test(text)) {
            context.report(node, new context.RuleError("found TODO: '" + text + "'"));
        }
    };
    exports[context.Syntax.ListItem] = function (node) {
        var text = context.getSource(node);
        if (/\[\s+\]\s/i.test(text)) {
            context.report(node, new context.RuleError("found TODO: '" + text + "'"));
        }
    };
    return exports;
};
```

As as result, linting following text with modified rule, a result was no error.

```markdown
[todo:image](http://example.com)
```

The rule created is [no-todo.js](../rules/no-todo.js).

### Rule Config

`.textlintrc` is the config file for textlint.

For example, there are a config file:

```json
{
  "rules": {
    "very-nice-rule": {
        "key": "value"
    },
  }
}
```

`very-nice-rule.js` rule get the options defined by the config file.

```js
module.exports = function(context, options){
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