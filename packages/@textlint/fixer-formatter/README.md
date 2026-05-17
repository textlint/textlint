# @textlint/fixer-formatter

textlint output formatter for fixer

## Installation

    npm install @textlint/fixer-formatter

## Usage

- [ ] TBD

## Writing a formatter

A fixer formatter receives `TextlintFixResult[]` and returns a single `string`. The returned string is written **as-is** to stdout or `--output-file` — the CLI does not append a trailing newline. Each formatter is responsible for its own trailing newline:

- **Human-readable formatters** (`stylish`, `compats`, `diff`) end with `\n` so the terminal prompt appears on the next line.
- **Machine-readable formatters** (`json`) do not append `\n`.
- **`fixed-result`** is a special case: it returns the fixed source as-is. Its trailing newline depends on the original input — the formatter preserves byte exactness so that piping `--fix --format fixed-result` to a file produces output identical to the source when no fix was needed.

See [textlint/textlint#2043](https://github.com/textlint/textlint/issues/2043) for the original discussion.

## Tests

    npm test

## License

MIT
