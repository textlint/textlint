# Config in package.json

`package.json`'s `"textlint"` field can be used for configuration.

- https://textlint.github.io/docs/configuring.html

## Usage

    npm run textlint
    # textlint -f pretty-error README.md


## package.json

```json
{
  "name": "textlint-example-config-in-package-json",
  "version": "2.1.10",
  "private": true,
  "description": "",
  "license": "MIT",
  "author": "azu",
  "main": "index.js",
  "scripts": {
    "test": "npm run textlint",
    "test:ci": "npm test",
    "textlint": "textlint -f pretty-error README.md"
  },
  "devDependencies": {
    "textlint": "^11.4.0",
    "textlint-rule-no-todo": "^2.0.1"
  },
  "textlint": {
    "rules": {
      "no-todo": true
    }
  }
}
```

## How to report Error

- [x] Check off Todo
