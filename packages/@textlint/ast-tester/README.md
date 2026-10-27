# @textlint/ast-tester

Compliance tests for [textlint](https://github.com/textlint/textlint "textlint")'s AST(Abstract Syntax Tree).

It check compliance of AST at minimum.

- [textlint/txtnode.md at master · textlint/textlint](https://github.com/textlint/textlint/blob/master/docs/txtnode.md "textlint/txtnode.md at master · textlint/textlint")

If you have created [Processor](https://github.com/textlint/textlint/blob/master/docs/plugin.md "Processor") plugin for textlint, you can use it for testing the plugin.

## Installation

    npm install -D @textlint/ast-tester

## Usage

### `test(textlintAST, options?): void`

if the AST is invalid, then throw Error

### `isTxtAST(textlintAST, options?): boolean`

if the AST is valid, then return `true`.

```js
import {test, isTxtAST} from "@textlint/ast-tester";
import yourParse from "your-parser";
// recommenced: test much pattern test
const AST = yourParse("This is text");
test(AST);// if the AST is invalid, then throw Error

isTxtAST(AST);// true or false
```
### Opt-in built-in node validation

The default behavior validates generic AST structure and remains permissive for plugin-defined node types. Both functions also accept an optional `{ strict: true }` argument to validate the declared fields of built-in node types, including required parent `children`, text `value`, `Header.depth` (1–6), resource/reference fields and applicable optional fields:

```js
test(AST, { strict: true }); // throws an error identifying the invalid node field
isTxtAST(AST, { strict: true }); // false if strict validation fails
```

Strict checking is recursive even under unknown plugin nodes. Unknown/custom node types, extra fields and synthetic visitor type names remain allowed; this is a manually maintained built-in field check, not a complete schema or child-placement validator. Omitting options or setting `strict: false` preserves the original generic behavior.

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
