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
Use it to find out which rules or files make textlint slow.

The following output is from [examples/perf](https://github.com/textlint/textlint/tree/master/examples/perf), which lints 17 Markdown files with `preset-jtf-style`, `max-ten`, `spellcheck-tech-word`, `prh`, and other rules:

```sh
$ npx textlint --profile md/
## textlint profile

Total: 1910.71 ms, 17 files

### Phases

| Phase | Time (ms) | % | Count |
| --- | ---: | ---: | ---: |
| startup | 95.19 | 5.0% | 1 |
| load-config | 98.63 | 5.2% | 1 |
| search-files | 9.90 | 0.5% | 1 |
| lint | 1667.15 | 87.3% | 1 |
| ↳ parse | 16.81 | 0.9% | 17 |
| ↳ traverse | 11.18 | 0.6% | 17 |
| ↳ rules | 1434.59 | 75.1% | 22616 |
| ↳ post-process | 0.74 | 0.0% | 17 |
| format | 35.52 | 1.9% | 1 |

Phases with ↳ are sums over the files, which are linted concurrently.

### Parsers

| Plugin | Time (ms) | Parsed texts |
| --- | ---: | ---: |
| @textlint/textlint-plugin-markdown | 16.81 | 17 |

### Rules

| Rule | Time (ms) | % | Calls |
| --- | ---: | ---: | ---: |
| max-ten | 1178.24 | 61.7% | 287 |
| spellcheck-tech-word | 113.22 | 5.9% | 593 |
| no-start-duplicated-conjunction | 100.53 | 5.3% | 334 |
| prh | 14.02 | 0.7% | 645 |
| jtf-style/1.1.1.本文 | 2.81 | 0.1% | 627 |
| no-mix-dearu-desumasu | 2.20 | 0.1% | 429 |
| jtf-style/1.1.3.箇条書き | 2.16 | 0.1% | 148 |
| jtf-style/2.2.2.算用数字と漢数字の使い分け | 2.16 | 0.1% | 593 |
| jtf-style/3.3.かっこ類と隣接する文字の間のスペースの有無 | 1.86 | 0.1% | 593 |
| jtf-style/4.3.1.丸かっこ（） | 1.42 | 0.1% | 593 |

27 more rules are in the JSON output (`--format json`).

### Slowest files

| File | Time (ms) |
| --- | ---: |
| md/variables.md | 1048.14 |
| md/gulp.md | 126.11 |
| md/ESLint.md | 100.31 |
...
```

### Reading the profile

- `Total` is the wall-clock time of the whole run. `%` in every table is a share of `Total`.
- **Phases**: start here to see which part of the run is slow.
    - `startup`, `load-config`, and `search-files` run once per run. If they are large, the cause is not the documents: for example, loading many rules and plugins, or searching a large directory.
    - `lint` is the time of linting all files. The rows with `↳` break it down into `parse` (the plugins parse the files into the AST), `traverse` (textlint walks the AST and calls the rules), `rules` (the handlers of the rules), and `post-process` (processing the messages of the rules). With `--fix`, `fix` appears instead of `lint`, and `apply-fixes` is added under it.
    - `Count` is the number of times the phase ran. For `parse`, it is the number of parsed texts. For `rules`, it is the number of calls of the rule handlers.
    - The rows with `↳` are sums over the files. Because textlint lints files concurrently, their sum can be larger than `lint`.
    - In this example, `rules` is 75.1% of the run, while `parse` and `traverse` are less than 1% each. So the rules decide the time of this run.
- **Parsers**: the parse time of each plugin. If `parse` is large, this table shows which plugin is slow.
- **Rules**: the ten slowest rules. `Calls` is the number of calls of the handlers of the rule. Rules in a preset are shown as `<preset>/<rule>`, and filter rules are marked with `(filter)`. Use `--format json` to see all rules.
    - A rule with a large time and a few calls spends much time in each call. A rule with many calls and a small time per call is cheap per node.
    - The time of a rule includes the work that the rule does once, such as loading a dictionary. When several rules share the same dictionary, the loading is counted for the rule that loads it first. In this example, `max-ten` loads the dictionary of a morphological analyzer, which is about 1 second of its time. Without `max-ten`, `no-mix-dearu-desumasu` loads it and becomes the slowest rule. To see the time of one rule alone, run textlint with only that rule.
- **Slowest files**: the ten files with the largest sum of the time of parsing, traversing, rules, and post-processing for the file. The one-time work of the rules is counted for the file that was being linted at that time. In this example, `md/variables.md` is small (1.3 KB) but is the slowest file, because the dictionary was loaded while it was linted.

### Notes

- The summary is Markdown. With `--format json`, it is JSON and has all rules.
- With `--output-file`, the lint results are written to the file, and the summary is printed to stdout.
- The exit status is the same as without `--profile`.
- While profiling, rule handlers run one by one, so that the time of a rule does not include the time of other rules. The run can be slower than usual.
- The time changes between runs. Run it a few times before comparing the numbers.

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

