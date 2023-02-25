# Failed to load textlint's module: "${packageName}" is not found.

**Target:** User

## Error messages

> Failed to load textlint's rule module: "prh" is not found.

> Failed to load textlint's preset module: "jtf-style" is not found.

> Failed to load textlint's plugin module: "html" is not found.

## Reason

You may have installed `textlint` and the rule/preset/plugin in different places.

`textlint` can not found the rule/preset/plugin package in different place.

## Solution A: Install `textlint` and the rule/preset/plugin in the same place

- If you have installed `textlint` as `--global`(`-g`), you must install each rule as `npm install --global <rule-package>`.
- If you have installed `textlint` as `--save-dev`(`-D`), you must install each rule as `npm install --save-dev <rule-package>`.

## Solution B: Check the rule name in `.textlintrc.json`

1. Update `textlint` and the rule/preset/plugin.
2. Check your `.textlintrc.json`'s "rules" section.

**1**: This error is caused by mismatch between `textlint` and the other(rule and preset, plugin).

**2**: This error is caused by invalid config value.

Check the rule name in `.textlintrc.json` and `package.json`

**rule**

In the following case, you have to installed `textlint-rule-foo` module via `npm install textlint-rule-foo`.
When `textlint-rule-foo` module is missing in `node_modules`, textlint throw this error.

```json
{
    "rules": {
        "foo" : true
    }
}
```

**preset**

In the following case, you have to installed `textlint-rule-preset-foo` module via `npm install textlint-rule-preset-foo`.
When `textlint-rule-preset-foo` module is missing in `node_modules`, textlint throw this error.

```json
{
    "rules": {
        "preset-foo" : true
    }
}
```

If you want to configure the rule in the preset, you can write the following config.

```json
{
    "rules": {
        "preset-foo" : {
           "<rule-name>": {
               "key": "value"
           }
        }
    }
}
```

See also [Configuring textlint](../configuring.md).
