# Creating preset

"preset" is a collection of rules and rulesConfig.

The basic source code format for a preset is:

```js
module.exports = {
    "rules": {
        "no-todo": require("textlint-rule-no-todo")
    },
    "rulesConfig": {
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
    "rules": {
        "ruleA": require("textlint-rule-A"),
        "ruleB": require("textlint-rule-B")
    },
    "rulesConfig": {
        "ruleA": true,
        "ruleB": true
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

You should add `textlint` to npm's `keywords`

```json
{
  "name": "textlint-rule-preset-foo-bar",
  "description": "Your preset of rules description",
  "version": "1.0.1",
  "keywords": [
    "textlint"
  ]
}
```

We recommend that preset's name should start with `textlint-rule-preset-*`.

e.g.) textlint-rule-preset-foo-bar
