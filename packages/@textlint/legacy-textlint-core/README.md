# @textlint/legacy-textlint-core

This package provides legacy `TextLintCore` compatible API.

- Issue: <https://github.com/textlint/textlint/issues/1310>

> [!WARNING]
> THIS PACKAGE IS DEPRECATED.

This compat package is deprecated. You should use `@textlint/kernel` or new APIs instead of it.

- [Use as Node Modules · textlint](https://textlint.github.io/docs/use-as-modules.html)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint/legacy-textlint-core

## Usage

This package provided a procedural API.

```ts
import { TextLintCore } from "@textlint/legacy-textlint-core";
// example packages
import rule from "textlint-rule-example";
import plugin from "textlint-plugin-example";

const textlintCore = new TextLintCore();
textlintCore.setupRules({ "example-rule": rule });
textlintCore.setupPlugins({ "example-plugin": rule });
const results = await textlintCore.lintText("test", ".example");
textlintCore.resetRules(); // reset setup
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
