# Failed to load textlint's module: "${packageName}" is not found.

**Target:** User

## Error messages

> Failed to load textlint's rule module: "prh" is not found.

> Failed to load textlint's preset module: "jtf-style" is not found.

> Failed to load textlint's plugin module: "html" is not found.

## Solution

1. Update `textlint` and the rule and preset, plugin.
2. Check your `.textlintrc` option value. 

**1**: This error is caused by mismatch between `textlint` and the other(rule and preset, plugin).

**2**: This error is caused by invalid config value.

- Check the rule name in `.textlintrc` and `package.json`

```json
{
    "rules": {
        "foo" : true
    }
}
```

In the cause, have to installed `textlint-rule-foo` module via `npm install textlint-rule-foo`.

When the module is missing in `node_modules`, textlint throw this error.
