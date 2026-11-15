---
id: cli
title: Command Line Interface
---

# Command Line Interface

The textlint Command Line Interface (CLI) is a tool for linting text from terminal.

## Run the CLI

textlint requires Node.js for running. Follow the instruction in the [Getting Started with textlint](./getting-started.md) to run the CLI.

Most users use [npx](https://docs.npmjs.com/cli/commands/npx) to run `textlint` command from terminal.

```sh
$ npx textlint README.md
```

textlint support glob pattern and directory as path.

```sh
# Should wrap the glob pattern with double quotes
$ npx textlint "docs/**/*.md"
# Run for directory
$ npx textlint docs/
```

## Options

You can view all the CLI options by running `textlint --help`.

```sh
$ textlint [options] file.md [file|dir|glob*]

Options:
  -h, --help                  Show help.
  -c, --config path::String   Use configuration from this file or sharable config.
  --ignore-path path::String  Specify path to a file containing patterns that describes files to ignore. - default: .textlintignore
  --init                      Create the config file if not existed. - default: false
  --fix                       Automatically fix problems
  --dry-run                   Enable dry-run mode for --fix. Only show result, don't change the file.
  --debug                     Outputs debugging information
  --profile                   Print where the time of the run is spent instead of the results. - default: false
  --print-config              Print the config object to stdout
  -v, --version               Outputs the version number.

Using stdin:
  --stdin                     Lint text provided on <STDIN>. - default: false
  --stdin-filename String     Specify filename to process STDIN as

Output:
  -o, --output-file path::String  Enable report to be written to a file.
  -f, --format String         Use a specific output format.

                              Available formatter          : checkstyle, compact, github, jslint-xml, json, junit, pretty-error, stylish, table, tap, unix

                              Available formatter for --fix: compats, diff, fixed-result, json, stylish - default: stylish
  --no-color                  Disable color in piped output.
  --quiet                     Report errors only. - default: false

Specifying rules and plugins:
  --no-textlintrc             Disable .textlintrc
  --plugin [String]           Set plugin package name
  --rule [String]             Set rule package name
  --preset [String]           Set preset package name and load rules from preset package.
  --rulesdir [path::String]   Use additional rules from this directory

Caching:
  --cache                     Only check changed files - default: false
  --cache-location path::String  Path to the cache file or directory - default: .textlintcache
  --cache-strategy String     Strategy for detecting changed files - either: metadata or content - default: metadata

Experimental:
  --experimental              Enable experimental flag.Some feature use on experimental.
  --rules-base-directory path::String  Set module base directory. textlint load modules(rules/presets/plugins) from the base directory.
  --mcp                       Start textlint as the Model Context Protocol (MCP) server.
```

## Pipe to textlint

textlint supports stdin from other commands via pipe.

```sh
$ cat README.md | npx textlint --stdin --stdin-filename "README.md"
```

You can get `--fix` result via `--format=fixed-result` formatter.

```sh
$ cat README.md | npx textlint --stdin --stdin-filename README.md --fix --format fixed-result --output-file NEW.md
```

Note: 

- `--stdin-filename` is required when using `--stdin` for recognizing the file type.
- Almost formatter output lint message, but `fixed-result` formatter output `--fix` result text.

## Cache

textlint supports caching for performance.
The cache is disabled by default.
You can enable it with the `--cache` option.

```bash
$ textlint --cache README.md
```

You can specify the cache strategy with `--cache-strategy` option:

- `metadata` (default): Use file metadata (mtime and size) to detect changes. This is faster but not reliable in CI.
- `content`: Use file content hash to detect changes. This is accurate and works in CI environments.

```bash
# Use metadata (default, fast, local only)
$ textlint --cache --cache-strategy metadata README.md

# Use content hash (CI-safe)
$ textlint --cache --cache-strategy content README.md
```

If you want to clear the cache, you can use the `--no-cache` option or just remove `--cache` option.


## Profile

`--profile` prints where the time of a run is spent, instead of the lint results:
the phases of the run (starting textlint, loading the configuration, searching files, parsing, traversing the AST, running rules, formatting), the parse time of each plugin, the slowest rules, and the slowest files.

```sh
$ npx textlint --profile docs/
## textlint profile

Total: 340.04 ms, 5 files

### Phases

| Phase | Time (ms) | % | Count |
| --- | ---: | ---: | ---: |
| startup | 177.36 | 52.2% | 1 |
| load-config | 46.64 | 13.7% | 1 |
| search-files | 8.45 | 2.5% | 1 |
| lint | 78.21 | 23.0% | 1 |
| ↳ parse | 7.76 | 2.3% | 5 |
| ↳ traverse | 10.27 | 3.0% | 5 |
| ↳ rules | 25.25 | 7.4% | 8967 |
| ↳ post-process | 0.26 | 0.1% | 5 |
| format | 26.78 | 7.9% | 1 |
...
```

- The summary is Markdown. With `--format json`, it is JSON and has all rules.
- With `--output-file`, the lint results are written to the file, and the summary is printed to stdout.
- The exit status is the same as without `--profile`.
- Phases with `↳` are sums over the files, because textlint lints files concurrently.
- While profiling, rule handlers run one by one, so that the time of a rule does not include the time of other rules. The run can be slower than usual.

## Exit Code

📝 This status is defined in textlint v13.0.0 or later.
🚀 File search error handling improved in textlint v15 or later.

`0`: No Error

- Not found lint error
- --fix: found errors but fix all errors, so exit with 0
- --output-file: Found lint error but --output-file is specified

`1`: Lint Error

- found lint error
- --fix: found errors and could not fix all errors, so exit with 1
- --dry-run: Found lint error but --dry-run is specified hence not fixed

`2`: Fatal Error

- Crash textlint process
- Fail to load config/rule/plugin
- File search errors

### File Search Error Details

Starting with textlint v15+, file search related errors return exit status 2 to align with ESLint's behavior:

```bash
# Non-existent file
$ textlint nonexistent.md
# Exit Status: 2

# Non-existent glob pattern  
$ textlint "nonexistent-dir/**/*.md"
# Exit Status: 2

# Mixed existing and non-existing files (only existing files are processed)
$ textlint existing.md nonexistent.md
# Exit Status: 0
```

This change allows scripts to distinguish between lint errors (exit status 1) and file search errors (exit status 2).

For comprehensive exit status behavior documentation, see [Exit Status FAQ](./faq/exit-status.md).

