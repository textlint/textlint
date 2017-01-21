# CLI example

## Usage

    npm run textlint
    # textlint -f pretty-error index.html


## textlintrc

Add `"html"` Processor plugin

```json
{
  "plugins": [
    "html"
  ],
  "rules": {
    "sentence-length": {
      "max": 15
    }
  }
}
```

## Test

Edit [index.html](./index.html) and Run.

A sentence length > 15 and throw Error.
