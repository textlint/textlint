---
id: configuring
title: Configuring textlint
---

## Configuration Files

You can use following file as configuration file:

- `.textlintrc` – try parse it as JSON, YAML or JS
- `.textlintrc.js` – parse it as JavaScript
- `.textlintrc.json` – parse it as JSON (with comment support)
- `.textlintrc.yml` – parse it as YAML
- `.textlintrc.yaml` – parse it as YAML

`.textlintrc` is a config file which is loaded as JSON, YAML or JS via [azu/rc-config-loader](https://github.com/azu/rc-config-loader).

**Note:** JSON configuration files (`.textlintrc.json` and `.textlintrc` with JSON format) support JavaScript-style comments (`//`) for better documentation of your configuration.

You can put the config of rules into `.textlintrc`

Or a `textlint` field in the `package.json` can be used.

## Rule

A **rule** provide linting/fixing function.

### Usage of rule

Add rule name to `rules` field.

```json
{
  "rules": {
    "no-todo": true
  }
}
```

You can also add comments to your configuration:

```json
{
  // Enable rules for checking text quality
  "rules": {
    "no-todo": true,  // Disallow TODO comments in text
    "max-comma": {
      "max": 3  // Maximum commas allowed in a sentence
    }
  }
}
```

### Enable/Disable rule

```json
{
  "rules": {
    "no-todo": true,
    "very-nice-rule": false
  }
}
```

- `true` means that enable `"no-todo"` rule
- `false` means that disable `"very-nice-rule"` rule

### Rule's options

Each rule's options can accept a `object`.

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
export default function rule(content, config){
    console.log(config);
    /* { "key" : "value" } */
}
```

### Rule name

```json
{
  "rules": {
    "<name>": true
  }
}
```

The rule `<name>` can be accept following patterns:

- `textlint-rule-<name>`
- `<name>`
- `@scope/textlint-rule-<name>`
- `@scope/<name>`

For example, following configs express the same thing.

```json
{
  "rules": {
    "cool": true
  }
}
```

is equal to

```json
{
  "rules": {
    "textlint-rule-cool": true
  }
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

:information_source: Examples

- [examples/config-file](https://github.com/textlint/textlint/tree/master/examples/config-file)
- [examples/config-in-package-json](https://github.com/textlint/textlint/tree/master/examples/config-in-package-json)

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

Put the config of `foo` rule in `text-rule-preset-example` rule-preset.

```json5
{
  "rules": {
    "preset-example": {
        "foo": true // configuration for "textlint-rule-foo" in "textlint-rule-preset-bar"
    }
  }
}
```

## Filter rule

Filter rule provide filtering error by linting rule.

For example, [textlint-filter-rule-comments](https://github.com/textlint/textlint-filter-rule-comments) provide filtering function by using comments.

```
<!-- textlint-disable -->

Disables all rules between comments

<!-- textlint-enable -->`
```

Allow to short `textlint-filter-rule-comments` to `comments`.

Add filter rule name to `filters` field.

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
    "node-types": {
      "nodeTypes": ["BlockQuote"]
    }
  },
  "rules": {
    "very-nice-rule": true
  }
}
```

:information_source: See [examples/filter](https://github.com/textlint/textlint/tree/master/examples/filter)

## Plugin

textlint can treat markdown and text file by default.

textlint support other file format by plugin.

- Other plugin
    - see [Processor Plugin list](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule#processor-plugin-list).
- How to create a plugin:
    - see [Plugin document](./plugin.md)

### Plugin option

textlint's built-in plugins are text and markdown.

- [`@textlint/textlint-plugin-text`](https://github.com/textlint/textlint/tree/master/packages/@textlint/textlint-plugin-text)
- [`@textlint/textlint-plugin-markdown`](https://github.com/textlint/textlint/tree/master/packages/@textlint/textlint-plugin-markdown)

These plugin support custom "extensions" options.

For example, if you want to treat `.hown` as markdown, put following config to `.textlintrc.json`    

```json5
{
    "plugins": {
        "@textlint/markdown": {
            "extensions": [".hown"]
        }
    }
}
```


## Sharable Configuration

textlint support module of configuration.

- [ ] Not support `config` in `.textlintrc.json` yet. See https://github.com/textlint/textlint/issues/210

Specify config module via `--config` command line option.

```
textlint --config <config-module-name>
textlint --config textlint-config-<name>
textlint --config @<scope>/<config-module-name>
```

## Overview

![rule-preset-plugin](assets/rule-preset-plugin.png)
