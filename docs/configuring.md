# Configuring textlint

## Configuration Files

- `.textlintrc`

`.textlintrc` is config file that is loaded as YAML, JSON or JS via [MoOx/rc-loader](https://github.com/MoOx/rc-loader "MoOx/rc-loader").

Put the config of rules into `.textlintrc`

## rules

### Enable/Diabel

```json
{
  "rules": {
    "no-todo": true,
    "very-nice-rule": false,
  }
}
```

It means that 

- enable "no-todo" rule
- disable "very-nice-rule" rule

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

- enable "no-todo" rule
- enable "very-nice-rule" rule and pass `{ "key" : "value" }` to the rule

For rules creator:

```
// "very-nice-rule"
export function rule(contet, config){
    console.log(config);
    /* { "key" : "value" } */
}
```

### Special rule's config

- `severity` : `"<warning|error>"` - default: "error"

```json
{
  "rules": {
    "no-todo": {
        "severity" : "warning"
     }
  }
}
```

it mean that 

- enable "no-todo" rule
- found thing match the rule and show warning message(exit status is `0`)

**summary**

Can use the following format:

```js
{
  "rules": {
    "<rule-name>": true | false | object
  }
}
```

:information_source: See [examples/config-file](../examples/config-file)

### Plugin

textlint plugin is a set of rules and rulesConfig.

To enable plugin, put the "plugin-name` into `.textlinrc`.

```js
// `.textlinrc`
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