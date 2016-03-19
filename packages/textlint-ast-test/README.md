# textlint-ast-test [![Build Status](https://travis-ci.org/textlint/textlint-ast-test.svg?branch=master)](https://travis-ci.org/textlint/textlint-ast-test)


Compliance tests for [textlint](https://github.com/textlint/textlint "textlint")'s AST(Abstract Syntax Tree).

- [textlint/txtnode.md at master · textlint/textlint](https://github.com/textlint/textlint/blob/master/docs/txtnode.md "textlint/txtnode.md at master · textlint/textlint")

If you create [Processor](https://github.com/textlint/textlint/blob/master/docs/plugin.md "Processor") plugin for textlint, you can use it for testing the plugin.

## Installation

    npm install -D textlint-ast-test

## Usage

### `test(textlintAST): void`

if the AST is invalid, then throw Error

### `isTextlintAST(textlintAST): boolean`

if the AST is valid, then return `true`.

```js
import {test, isTextlintAST} from "textlint-ast-test";
import yourParse from "your-parser";
// recommenced: test much pattern test
const AST = yourParse("This is text");
test(AST);// if the AST is invalid, then throw Error

isTextlintAST(AST);// true or false
```
## Tests

    npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT