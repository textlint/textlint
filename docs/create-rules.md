# Creating Rules

Textlint's AST(Abstract Syntax Tree) is defined these pages.

- [txtnode.d.ts](./txtnode.d.ts)
- [TxtNode interface](./txtnode.md)

Each rules are represented by a object with several properties.
The properties are equivalent to AST node types from TxtNode.

Put simply you can write following:

```js
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    // root object
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

## RuleContext

RuleContext object has following property:

- `Syntax.*` has const values of [TxtNode type](./txtnode.md).
    - e.g.) `context.Syntax.Str`
- `RuleError(<message>)` is like Error object.
    - e.g.) `new context.RuleError("found rule error")`
- `report(<node>, <ruleError>)` is a method reports a message from one of the rules.
    - e.g.) `context.report(node, new context.RuleError("found rule error"));`
- `getSource(<node>)`  is a method gets the source code for the given node.
    - e.g.) `context.getSource(node); // => "text"`


See also [Working with Rules](http://eslint.org/docs/developer-guide/working-with-rules.html "Working with Rules") on ESLint.

## Example: creating `no-todo` rules.

This example aim to found `- [ ]` and `todo:` texts.

Rule file name is equal to rule ID(i.e., no-todo.js for rule ID no-todo).


File Name: [no-todo.js](../rules/no-todo.js)

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
        if (/\[\s*?\]\s/i.test(text)) {
            context.report(node, new context.RuleError("found Todo: " + text));
        }
    };
    return exports;
};

```

Example text:

```
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

## Publish info

You should add `textlint` to npm's `keywords`

```json
{
  "name": "textlint-no-todo",
  "description": "Your custom rules description",
  "version": "1.0.1",
  "homepage": "https://github.com/azu/textlint-custom-rules/",
  "keywords": [
    "textlint"
  ],
}
```

- [package.json | npm Documentation](https://docs.npmjs.com/files/package.json "package.json | npm Documentation")
- [results for textlint](https://www.npmjs.com/search?q=textlint "results for textlint")

Case example:

- [spellcheck-tech-word-textlint-rule](https://www.npmjs.com/package/spellcheck-tech-word-textlint-rule "spellcheck-tech-word-textlint-rule")