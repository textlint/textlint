# textlint-scripts

textlint scripts help you to create textlint rule.

Documentation of creating a textlint rule:

- [Creating Rules · textlint](https://textlint.org/docs/rule.html)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install textlint-scripts --save-dev

## Usage

Use `textlint-scripts` as [npm-scripts](https://docs.npmjs.com/misc/scripts).

```json
{
    "scripts" : {
        "build": "textlint-scripts build",
        "test": "textlint-scripts test"
    }
}
```

:memo: **TypeScript**

`textlint-scripts` support TypeScript.

`textlint-scripts` detect the project is TypeScript by `tsconfig.json` in project root directory.

### `textlint-scripts build`

Build source codes in `src/` and output to `lib/`.

It is built by [Babel](https://babeljs.io/) with [`env` preset](https://babeljs.io/docs/plugins/preset-env/).

Additionally, `build` command inline [Node fs calls](https://nodejs.org/api/fs.html) with [babel-plugin-static-fs](https://github.com/Jam3/babel-plugin-static-fs) for browser compatibility. 
(Web Browser does not support Node.js's `fs` module, this inlining feature improve compatibility between Node.js and Web Browser.)

:memo: Disable inlining by `$ NO_INLINE=1 textlint-scripts build`.

### `textlint-scripts test`

Run test codes in `test/` with the [Node.js test runner](https://nodejs.org/api/test.html) (`node:test`).
Test files are `test/**/*.js`, and also `test/**/*.ts` in a TypeScript project.

Usually test textlint rule using [textlint-tester](https://github.com/textlint/textlint/tree/master/packages/textlint-tester).

- Test and source files are transpiled by [Babel](https://babeljs.io/) on the fly, so `import` without a file extension and `__dirname` work.
- In a TypeScript project, `tsc -p tsconfig.json` type-checks the project before the tests run.
- Mocha-style globals are available: `describe`, `context`, `it`, `specify`, `before`, `after`, `beforeEach`, and `afterEach`, with `.only` and `.skip`.
  A test function that takes `done` is a callback-style test. `this.skip()` skips the test, and `this.timeout()` is ignored.
- The default timeout of each test is 10 seconds.

Arguments are passed to the Node.js test runner.

```shell
# Change the timeout of each test
textlint-scripts test --test-timeout=20000
# Run tests whose name matches the pattern
textlint-scripts test --test-name-pattern="jquery"
# Re-run tests when files change
textlint-scripts test --watch
```

:memo: `textlint-scripts test` does not use Mocha, and does not read `.mocharc.*` or `test/mocha.opts`.
Pass the options as arguments instead.

**Notes**: register script

textlint-scripts also provide register script for run-time build.
It will help to run tests from your IDE like WebStorm.

```shell
# Mocha is not a dependency of textlint-scripts. Install it if you use it.
mocha --require textlint-scripts/register "test/**/*.js"
```

`textlint-scripts/register-ts` is the same as `textlint-scripts/register`.
It transpiles TypeScript with Babel and does not type-check.

## Changelog

See [Releases page](https://github.com/textlint/textlint/releases).

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
