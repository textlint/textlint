# Creating preset

"preset" is a collection of rules and rulesConfig.

The basic source code format for a preset is:

```js
module.exports = {
    rules: {
        "no-todo": require("textlint-rule-no-todo")
    },
    rulesConfig: {
        "no-todo": true
    }
};
```

- `"rules"` is rule creator object.
- `"rulesConfig"` is rule config object for `"rules"`.

## Example
 
e.g.) "textlint-rule-preset-gizmo"

textlint-rule-preset-gizmo includes the following rules:

- ruleA
- ruleB

`textlint-rule-preset-gizmo.js`: 

```js
module.exports = {
    rules: {
        ruleA: require("textlint-rule-A"),
        ruleB: require("textlint-rule-B")
    },
    rulesConfig: {
        ruleA: true,
        ruleB: true
    }
};
```

Usage of "textlint-rule-preset-gizmo":

`.textlintrc`

```json
{
    "rules": {
        "preset-gizmo": {
            "ruleA": false
            /* ruleB's options is defined by preset-gizmo */
        }
    }
}
```


## Publishing

If you want to publish your textlint rule preset, see following documents.


### Package Naming Conventions

textlint rule package naming should have `textlint-rule-preset-` prefix.
 
- `textlint-rule-preset-<name>`
- `@scope/textlint-rule-preset-<name>`
    - textlint supports [Scoped packages](https://docs.npmjs.com/misc/scope "Scoped packages")

Example: `textlint-rule-preset-example`

textlint user use it following:

```json
{
    "rules": {
        "preset-example": true
    }
}
```

Example: `@textlint-rule/textlint-rule-preset-google-developer`

textlint user use it following:

```json
{
    "rules": {
        "@textlint-rule/preset-google-developer": true
    }
}
```

### Keywords

You should add `textlintrule` to npm's `keywords`

```json
{
  "name": "textlint-rule-preset-foo-bar",
  "description": "Your preset of rules description",
  "version": "1.0.1",
  "keywords": [
    "textlintrule"
  ]
}
```
