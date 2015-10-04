# CLI example

## Usage

    npm run textlint
    # textlint -f pretty-error README.md


## textlintrc

```json
{
  "plugin": [
    "jtf-style"
  ],
  // overwrite rules 
  "rules": {
    "jtf-style/4.1.1.句点(。)": false
  }
}
```

## How to report Error

「match the plugin rules。」
「プラグインで定義されてるルールでチェックされるものがあればエラーとなる」

- [ ] use global plugin
