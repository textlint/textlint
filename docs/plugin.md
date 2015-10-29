# Plugin

Each plugin is an npm module with a name in the format of `textlint-plugin-<plugin-name>`, such as `textlint-plugin-english`.

- [ ] `@<scope>/textlint-plugin-<plugin-name>` support

## Create a Plugin

Plugin is a set of `rules` and `rulesConfig`.

If your plugin has rules, then it must export an object with a rules property.
This rules property should be an object containing a key-value mapping of rule ID to rule.
The rule ID does not have to follow any naming convention (so it can just be `no-todo`, for instance).

```js
module.exports = {
    rules: {
        "no-todo": function (context, options) {
            // rule implementation ...
        }
    },
    rulesConfig: {
        "no-todo": true
    }
};
```

## How to create rule?

This is the same way of textlint rule.
 
See [create-rules.md](./create-rules.md).

## Default Configuration for Plugins
   
You can provide default configuration for the rules included in your plugin by modifying exported object to include rulesConfig property.
rulesConfig follows the same pattern as you would use in your `.textlintrc` config rules property, but without plugin name as a prefix.
   
```js
module.exports = {
   rules: {
       "myFirstRule": require("./lib/rules/my-first-rule"),
       "mySecondRule": require("./lib/rules/my-second-rule")
   },
   rulesConfig: {
       "myFirstRule": true,
       "mySecondRule": {
          "key": "value"
       }
   }
};
```

## Processor

- [ ] Write Pre/PostProcessor https://github.com/textlint/textlint/pull/36

## Testing

You can test the rules of your plugin the same way as bundled textlint rules using [textlint-tester](https://github.com/textlint/textlint-tester "textlint-tester").

```js
var TextLintTester = require("textlint-tester");
var tester = new TextLintTester();
var noTodo = require("textlint-rule-no-todo");
// ruleName, rule, expected[]
tester.run("no-todo", noTodo, {
    valid: [
        "string, test desu",
        {
            text: "日本語 is Japanese."
        }
    ],
    invalid: [
        // text, expected errors
        {
            text: "- [ ] string",
            errors: [
                {message: "found TODO: '- [ ] string'"}
            ]
        },
        {
            text: "TODO: string",
            errors: [
                {message: "found TODO: 'TODO: string'"}
            ]
        }
    ]
});
```


The plugin system is a inspired/fork of ESLint.

- [Documentation - ESLint - Pluggable JavaScript linter](http://eslint.org/docs/developer-guide/working-with-plugins "Documentation - ESLint - Pluggable JavaScript linter")