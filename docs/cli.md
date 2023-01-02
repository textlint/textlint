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
  --print-config              Print the config object to stdout
  -v, --version               Outputs the version number.

Using stdin:
  --stdin                     Lint text provided on <STDIN>. - default: false
  --stdin-filename String     Specify filename to process STDIN as

Output:
  -o, --output-file path::String  Enable report to be written to a file.
  -f, --format String         Use a specific output format.

                              Available formatter          : checkstyle, compact, jslint-xml, json, junit, pretty-error, stylish, table, tap, unix

                              Available formatter for --fix: compats, diff, json, stylish - default: stylish
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

Experimental:
  --experimental              Enable experimental flag.Some feature use on experimental.
  --rules-base-directory path::String  Set module base directory. textlint load modules(rules/presets/plugins) from the base directory.
  --parallel                  Lint files in parallel
  --max-concurrency Number    maxConcurrency for --parallel
```

## Pipe to textlint

textlint supports piping from other commands.

```sh
$ cat README.md | npx textlint --stdin --stdin-filename "README.md"
```

Note: 

- `--stdin-filename` is required when using `--stdin` for recognizing the file type.
- `--fix` is not supported when using `--stdin`
    - Issue: <https://github.com/textlint/textlint/issues/967>

## Cache

textlint supports caching for performance.
The cache is disabled by default.
You can enable it with the `--cache` option.

```bash
$ textlint --cache README.md
```

If you want to clear the cache, you can use the `--no-cache` option or just remove `--cache` option.


## Exit Code

📝 This status is defined in textlint v13.0.0 or later.

`0`: No Error

- Not found lint error
- --fix: found errors but fix all errors, so exit with 0
- --output-file: Found lint error but --output-file is specified
- --dryRun: Found lint error but --dryRun is specified

`1`: Lint Error

- found lint error
- --fix: found errors and could not fix all errors, so exit with 1

`2`: Fatal Error

- Crash textlint process
- Fail to load config/rule/plugin etc...

