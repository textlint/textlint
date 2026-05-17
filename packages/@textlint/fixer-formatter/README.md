# @textlint/fixer-formatter

textlint output formatter for fixer

## Installation

    npm install @textlint/fixer-formatter

## Usage

- [ ] TBD

## Writing a formatter

A fixer formatter receives `TextlintFixResult[]` and returns a single `string`. The returned string is written **as-is** to stdout or `--output-file` — the CLI does not append a trailing newline. Each formatter is responsible for its own trailing newline.

By convention, every built-in fixer formatter (`stylish`, `compats`, `diff`, `json`) ends its non-empty output with `\n`, so that stdout produces a clean terminal break and `--output-file` produces a well-formed text file.

The one exception is **`fixed-result`**, which returns the fixed source as-is. Its trailing newline depends on the original input — the formatter preserves byte exactness so that piping `--fix --format fixed-result` to a file produces output identical to the source when no fix was needed.

See [textlint/textlint#2043](https://github.com/textlint/textlint/issues/2043) for the original discussion.

## Tests

    npm test

## License

MIT
