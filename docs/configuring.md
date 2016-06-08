# Configuring textlint

## Configuration Files

- `.textlintrc`

`.textlintrc` is config file that loaded as YAML, JSON or JS via [MoOx/rc-loader](https://github.com/MoOx/rc-loader "MoOx/rc-loader").

Put the config of rules into `.textlintrc`

## Rule

A **rule** provide linting/fixing function. 

### Enable/Disable rule

```json
{
  "rules": {
    "no-todo": true,
    "very-nice-rule": false,
  }
}
```

It means that 

- enable `"no-todo"` rule
- disable `"very-nice-rule"` rule

### Rule's config

Each rule's config can accept a `object`.

```json
{
  "rules": {
    "no-todo": true, 
    "very-nice-rule": {
        "key": "value"
    }
  }
}
```

It means that

- enable `"no-todo"` rule
- enable `"very-nice-rule"` rule and pass `{ "key" : "value" }` to the rule

For rules creator:

```
// "very-nice-rule"
export default function rule(contet, config){
    console.log(config);
    /* { "key" : "value" } */
}
```

### Severity config of rules

- `severity` : `"<warning|error>"` - Default: "error"

```json
{
  "rules": {
    "no-todo": {
        "severity" : "warning"
     }
  }
}
```

It means that

- enable "no-todo" rule
- found thing match the rule and show warning message(exit status is `0`)

**Summary**

Can use the following format:

```
{
  "rules": {
    "<rule-name>": true || false || object
  }
}
```

:information_source: See [examples/config-file](../examples/config-file)

## Rule-preset

Rule-preset is a collection of rules.

The way of configuration is same with textlint-rule.

```json
{
  "rules": {
    "preset-example": true
  }
}
```

Put the config of `textlint-rule-foo` rule in `text-rule-preset-bar` rule-preset.

```json
{
  "rules": {
    "preset-example": {
        "foo": true // configuration for "textlint-rule-foo"
    }
  }
}
```

## Filter rule

Filter rule provide filtering error by linting rule.

For example, [textlint-filter-rule-comments](https://github.com/textlint/textlint-filter-rule-comments) provide filtering function by using comment like `<!-- textlint-disable -->` and `<!-- textlint-enable -->`. 
Allow to short `textlint-filter-rule-comments` to `comments`.

```json
{
  "filters": {
    "comments": true
  }
}
```

One more example, `very-nice-rule` is useful, but you want to ignore some reported error in your text.
`very-nice-rule` also check the `BlockQuote` text, but you want to ignore the `BlockQuote` text.
[textlint-filter-rule-node-types](https://github.com/textlint/textlint-filter-rule-node-types) rule resolve the issue.

```json
{
  "filters": {
    "ignore-node-types": {
      "nodeTypes": ["BlockQuote"]
    }
  },
  "rules": {
    "very-nice-rule": true
  }
}
```

:information_source: See [examples/filter](../examples/filter)

## Plugin

textlint plugin also has a set of rules and rulesConfig.

It is similar to preset, but plugin's [main task is extension of feature](./plugin.md)

To enable plugin, put the "plugin-name" into `.textlinrc`.

```json
{
    "plugins": [
        "plugin-name"
    ],
    // overwrite-plugins rules config
    // <plugin>/<rule>
    "rules": {
        "plugin-name/rule-name" : false
    }
}
```

:information_source: See [docs/plugin.md](docs/plugin.md)

## Sharable Configuration

textlint support module of configuration.

- [ ] Not support `config` in `.textlintrc` yet. See https://github.com/textlint/textlint/issues/210

Specify config module via `--config` command line option.

```
textlint --config <config-module-name>
textlint --config textlint-config-<name>
textlint --config @<scope>/<config-module-name>
```

## Overview

![rule-preset-plugin](resources/rule-preset-plugin.png)
