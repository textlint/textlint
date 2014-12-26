# Create Rules

Textlint's AST(Abstract Syntax Tree) is defined these pages.

- [txtnode.d.ts](./txtnode.d.ts)
- [TxtNode interface](./txtnode.md)

Each rule is represented by a object with several properties.
The properties are equivalent to AST node types from TxtNode.

put simply you can write following:

```js
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};
    // root object
    exports[context.Syntax.Document] = function (node) {
    };
    exports[context.Syntax.Str] = function (node) {
        if(/found wrong use-case/.test(node.raw){
            // report error
            context.report(node, "found wrong");
        }
    };
    exports[context.Syntax.Break] = function (node) {
    };
    return exports;
};
```

See [Working with Rules](http://eslint.org/docs/developer-guide/working-with-rules.html "Working with Rules") on ESLint.