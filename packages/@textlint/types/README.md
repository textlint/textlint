# @textlint/types

Type definition pacakge for textlint.

## Type Interface

### Rule types

Rule types includes following definition.

- Rule module types
- Rule report function types
- Rule Context types

Rule types is depended from textlint's rule module and `@textlint/kernel`.
By contrasts, textlint's rule module should not depended on `@textlint/kernel`

- OK: Rule types <--- Rule module
- OK: Rule types <--- Kernel module
- NG: Kernel module <--- Rule module
- NG: Kernel module ---> Rule module

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint/types

## Usage

```ts
export { TextlintSourceCode, TextlintSourceCodeArgs, TextlintSourceCodeLocation, TextlintSourceCodePosition, TextlintSourceCodeRange } from "@textlint/types";
export { TextlintFilterRuleContext } from "@textlint/types";
export { TextlintRuleContext } from "@textlint/types";
export { TextlintRuleContextFixCommand } from "@textlint/types";
export { TextlintRuleContextFixCommandGenerator } from "@textlint/types";
export { TextlintRuleError } from "@textlint/types";
export { TextlintRuleOptions } from "@textlint/types";
export { TextlintRuleSeverityLevel } from "@textlint/types";
```

## Changelog

See [Releases page](https://github.com/textlint/textlint/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/textlint/textlint/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
