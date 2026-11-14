# textlint-scripts-example-ts

Example of textlint-scripts with TypeScript

## Install

Install with [npm](https://www.npmjs.com/):

    npm install textlint-scripts-example-ts

## Usage

Via `.textlintrc.json`(Recommended)

```json
{
    "rules": {
        "textlint-scripts-example-ts": true
    }
}
```

Via CLI

```
textlint --rule textlint-scripts-example-ts README.md
```

### Build

Builds source codes for publish to the `lib` folder.
You can write ES2015+ source codes in `src/` folder.

    npm run build

### Tests

Run test code in `test` folder.
Test textlint rule by [textlint-tester](https://github.com/textlint/textlint-tester).

    npm test

## License

MIT © azu
