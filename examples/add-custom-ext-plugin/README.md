# Custom extensions support

textlint can lint custom extension file as specified format.

## Usage

    npm run textlint
    # textlint -f pretty-error ./test.custom-ext

## textlintrc

If you want to lint `.custom-ext` as Markdown,
you add `"extensions"` option to `@textlint/markdown` plugin.

```json
{
  "plugins": {
    "@textlint/markdown": {
      "extensions": [
        ".custom-ext"
      ]
    }
  },
  "rules": {
    "no-todo": true
  }
}
```


## Test file

See [test.custom-ext](./test.custom-ext)
