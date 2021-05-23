# textlint-scripts

textlint scripts help you to create textlint rule.

Documentation of creating a textlint rule:

- [Creating Rules · textlint](https://textlint.github.io/docs/rule.html)

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

Test test codes in `test/` by [Mocha](https://mochajs.org/).

Usually test textlint rule using [textlint-tester](https://github.com/textlint/textlint/tree/master/packages/textlint-tester). 

**Notes**: register script

textlint-scripts also provide register script for run-time build.
It will help to run tests from your IDE like WebStorm.

```
# js
mocha --require textlint-scripts/register "test/**/*.js"
# ts
mocha --require textlint-scripts/register-ts "test/**/*.ts"
``` 

## Changelog

See [Releases page](https://github.com/textlint/textlint/releases).

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
