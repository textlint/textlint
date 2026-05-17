# @textlint/linter-formatter

[textlint](https://github.com/textlint/textlint "textlint/textlint") output formatter.

## Installation

```
npm install @textlint/linter-formatter
```

## Usage

See [formatters/](src/formatters).

Currently, you can use "stylish" (defaults), "checkstyle", "compact", "github", "jslint-xml", "json", "junit", "pretty-error", "table", "tap", and "unix".

```js
const { loadFormatter } = require("@textlint/linter-formatter");
const formatter = await loadFormatter({
    formatterName: "stylish"
});
const output = formatter.format([
    {
        filePath: "./README.md",
        messages: [
            {
                ruleId: "semi",
                line: 1,
                column: 23,
                message: "Expected a semicolon."
            }
        ]
    }
]);
console.log(output);
/*
./README.md
  1:23  warning  Expected a semicolon  semi

✖ 1 problem (0 errors, 1 warning)
*/
```


## API

```typescript
export declare type FormatterConfig = {
    color?: boolean;
    formatterName: string;
};
export interface FormatterDetail {
    name: string;
}
export declare function getFormatterList(): FormatterDetail[];
```

## CLI

```
$ textlint -f json README.md --rule no-todo | textlint-formatter -f pretty-error --stdin
```

## Other formatter

- [azu/textlint-formatter-codecov: textlint formatter for codecov json.](https://github.com/azu/textlint-formatter-codecov)
- [azu/textlint-formatter-lcov: textlint formatter for lcov format](https://github.com/azu/textlint-formatter-lcov)

## Writing a formatter

A formatter receives `TextlintResult[]` and returns a single `string`. The returned string is written **as-is** to the destination — both stdout and `--output-file` get byte-identical content. The CLI does not append a trailing newline.

This means each formatter is responsible for its own trailing newline. By convention, every built-in formatter ends its non-empty output with `\n` so that:

- the terminal prompt appears on the next line when output goes to stdout, and
- output written to `--output-file` is a well-formed text file (POSIX text files end with `\n`).

Empty output (no problems to report) returns `""`; no newline is added.

See [textlint/textlint#2043](https://github.com/textlint/textlint/issues/2043) for the original discussion.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
