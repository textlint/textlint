# CLI example

## Usage

    npm run textlint
    # textlint -f pretty-error README.md


## textlintrc

```json
{
  "rules": {
    "no-todo": true,
    "max-number-of-lines": {
      "max": 10
    }
  }
}
```

## How to ignore text

<!-- textlint-disable no-todo -->

- [ ] This is TODO

<!-- textlint-enable no-todo -->

OK. No error.
