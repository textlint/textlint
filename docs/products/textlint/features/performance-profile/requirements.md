# Performance profile

[日本語](requirements.ja.md)

## About this document

The performance profile shows where the time of one textlint run is spent, so that a slow run can be explained and the part to improve can be found.
textlint does more than one kind of work for each file: a plugin parses the text into TxtAST, the kernel traverses the tree and calls the listeners of the rules for each node, and the rules do their own checks.
Each of them can be the slow part, so the profile shows them separately, together with the work around them, such as loading the configuration and formatting the results.
The parent Product is [textlint](../../product.md).

### Scope

- The summary that `textlint --profile` prints: phases, parsers, rules, and files
- The summary as Markdown and as JSON
- The cost of the profile for a run with it and a run without it
- The totals that a program gets from the profiler of `@textlint/kernel`

### Out of scope

- How fast textlint lints. This feature measures it and does not define it.
- A CPU profile of the JavaScript engine, such as `node --cpu-prof`. It shows functions, and this feature shows the work of textlint: phases, parsers, and rules. [Change comparison](../change-comparison/requirements.md) collects CPU profiles.
- Measuring the run time many times to get stable numbers. A benchmark tool such as hyperfine does it. The profile explains one run.
- Comparing two builds of textlint. It belongs to [Change comparison](../change-comparison/requirements.md).
- The profile in browsers. The kernel runs there, but the CLI is the only place that prints the summary.

## User stories

### See where the time of a run goes

As a developer of textlint or a user with a slow run, I want the time of each phase of a run so that I know which part to look at: starting Node.js and loading textlint, loading the configuration, searching files, parsing, traversing the tree, running the rules, or formatting.

**Acceptance criteria:**

Scenario: When `--profile` is specified, the summary shows the time of each phase

- Given: A directory has Markdown files and a configuration with rules.
- When: The developer runs `textlint --profile docs/`.
- Then: The standard output has the summary in Markdown and no lint results. The summary starts with the total time and the number of the linted files, and has a row for each phase with its time, its percentage of the total time, and how many times it ran.

Scenario: When the number of files grows, the size of the summary does not grow

- Given: One directory has 10 files and another has 10,000 files.
- When: The developer runs `textlint --profile` for each directory.
- Then: Both summaries have the same sections, and the sections of rules and files have at most 10 rows each.

### Tell the parser, the traversal, and the rules apart

As a developer who changes a parser or the kernel, I want the time of parsing, the time of traversing the tree and calling listeners, and the time of the rules as separate numbers so that I can see whether my change is in the part that costs time.

**Acceptance criteria:**

Scenario: When files of two formats are linted, the summary shows the parse time of each plugin

- Given: A directory has Markdown files and plain text files.
- When: The developer runs `textlint --profile` for the directory.
- Then: The summary has a row for each plugin that parsed a file, with its parse time and the number of the files it parsed.

Scenario: When a rule is slow, it is at the top of the rules

- Given: The configuration has a rule that takes most of the time of the run.
- When: The developer runs `textlint --profile`.
- Then: The rule is the first row of the rules, with its time, its percentage of the total time, and how many times its listeners were called.

### Read the profile from a program or an AI agent

As an AI agent or a script that investigates performance, I want all numbers of the profile as JSON so that I can compare runs without parsing a table.

**Acceptance criteria:**

Scenario: When `--profile` and `--format json` are specified, the summary is JSON with all rules

- Given: A directory has files to lint and a configuration.
- When: The agent runs `textlint --profile --format json docs/`.
- Then: The standard output is one JSON object that has `total`, `files`, `phases`, `parsers`, `rules`, and `slowestFiles`. `rules` has every rule and filter rule that ran, in the order of the time. `slowestFiles` has at most 10 files.

Scenario: When `--profile` and `--output-file` are specified, the lint results go to the file and the summary to the standard output

- Given: A directory has files to lint and a configuration.
- When: The developer runs `textlint --profile --output-file result.txt docs/`.
- Then: The file has the lint results in the format of `--format`. The standard output has the summary only.

### Pay nothing when the profile is not used

As a user who does not look at the profile, I want a run without `--profile` to be as fast as a run of textlint without this feature.

**Acceptance criteria:**

Scenario: When `--profile` is not specified, nothing is recorded and no summary is printed

- Given: A directory has files to lint and a configuration.
- When: The user runs `textlint docs/`.
- Then: The standard output has only the lint results. The profiler has no totals.

Scenario: When `--profile` is not specified, the run time does not change by this feature

- Given: Two builds of textlint differ only in the code of this feature, and a directory has thousands of files.
- When: Each build lints the directory many times without `--profile`, in turns.
- Then: The difference of the median run times is within the difference between two series of runs of the same build.

## KPIs

None. No metric is defined for this feature.

## Functional requirements

### Summary of a run

**Overview:** Prints a summary of where the time of the run was spent, instead of the lint results.

**Input:** `--profile`, with the files or the STDIN content to lint, with or without `--fix`. `--format json` selects JSON; any other format selects Markdown.

**Output:** The summary on the standard output. The lint results are not printed. The exit status is the one of the run without `--profile`.

#### Applicable conditions

##### What `--profile` changes

A run with `--profile` is for looking at the profile, so the standard output has one document: the summary.
The run still goes to its end, including the formatter and writing fixed files, so the summary has the time of each of them.
With `--output-file`, the lint results are written to the file as without `--profile`.

##### Phases

| Phase | What it covers | How the time is counted |
| --- | --- | --- |
| startup | Starting Node.js and loading the modules of textlint, until the CLI starts to lint | Once |
| load-config | Loading the configuration, rules, filter rules, and plugins | Once |
| search-files | Finding the files that match the arguments | Once |
| lint (fix with `--fix`) | Linting all files, from the first file to the last result | Once |
| parse | A plugin parsing a text into TxtAST | Sum over files. In lint |
| traverse | The kernel walking the tree and calling the listeners for each node, without the time in the listeners | Sum over files. In lint |
| rules | The listeners of the rules | Sum over rules. In lint |
| filter-rules | The listeners of the filter rules | Sum over filter rules. In lint |
| post-process | The plugin and the kernel processing the messages of a file | Sum over files. In lint |
| apply-fixes | Applying the fixes of a rule to the text, with `--fix` | Sum over files. In lint |
| format | The formatter creating the output | Once |
| write-files | Writing fixed files, with `--fix` and without `--dry-run` | Once |

A phase that runs in another phase is shown under it with `depth` 1. The time of lint includes the phases in it and the time when the files are read.
textlint lints the files concurrently, so the phases in lint are sums of the times of each file, not periods of the wall clock.

##### Time of a rule

The time of a rule is the time from the start of its listener to the end of the Promise that the listener returns.
To keep the time of one rule out of another, the listeners run one after another while the profile is on.
This changes the order in which the work of concurrent listeners is done, but not the messages of the run.

##### Sections of the summary

| Section | A row is | Values of a row | Rows in Markdown | Rows in JSON |
| --- | --- | --- | --- | --- |
| Phases | A phase that ran | Time, percentage of the total time, count | All | All |
| Parsers | A plugin that parsed a file | Time, number of parsed texts | All | All |
| Rules | A rule or a filter rule that ran | Time, percentage of the total time, number of listener calls | 10 with the longest time | All |
| Files | A linted file | Time of parse, traverse, rules, filter rules, and post-process for the file | 10 with the longest time | 10 with the longest time |

##### Text of the summary

A time is in milliseconds with two decimals.
A file path is relative to the current working directory.
Characters that would break a table or control a terminal are escaped or removed from file paths and ids.

#### Exceptional behavior

##### The run fails

The summary is printed to the standard output with what was recorded until the failure, and the error follows on the standard error.

##### No rules are configured

The warning that no rules are found goes to the standard error, so the standard output has only the summary, which a JSON parser can read. The exit status is 1, as without `--profile`.

##### `--cache` skips files

A file that `--cache` skips is not counted in the number of the linted files, because it is not parsed or linted.

### Cost of the profile

**Overview:** The profile costs almost nothing when it is off, and stays close to a normal run when it is on.

**Input:** A run with or without `--profile`.

**Output:** None. It is a limit on the run time.

#### Applicable conditions

##### The profile is off

A run without `--profile` has no performance loss from this feature that can be measured: the kernel checks once for each file and each listener whether the profile is on, and does nothing for each node.

##### The profile is on

A run with `--profile` can take longer than a run without it, because it reads the clock for each listener call and runs the listeners one after another.
The numbers explain one run; [Change comparison](../change-comparison/requirements.md) measures the run time without `--profile`.

### Totals for a program

**Overview:** A program that runs the kernel gets the totals that the summary is made from.

**Input:** The program enables the profiler of `@textlint/kernel` and lints.

**Output:** A list of totals. A total has a type (what was measured), an id (a plugin id, a rule id, or a file path; none for a phase), a count, the total time, and the longest time of one record.

#### Applicable conditions

The profiler keeps totals only, so the size of the list depends on the number of phases, plugins, rules, and files, not on how many times they ran.
Disabling the profiler clears the totals.

## Data requirements

### Required data

- **Total of a type and an id:** count, total time, and the longest time. It is kept in memory during the process.

### Relationships

A total of a file is the sum of the totals of parse, traverse, rules, filter rules, and post-process recorded for that file.

### Personal information

None is collected. The summary has file paths and ids of plugins and rules, and no content of a file.

## External service dependencies

None.

## Security considerations

A file name can have any character, and the summary prints file paths to a terminal. The summary escapes the characters that break a Markdown table and removes control characters, so a file name can not rewrite the output of the terminal.
The summary never has the content of a file or a message of a rule.

## Open questions

None.
