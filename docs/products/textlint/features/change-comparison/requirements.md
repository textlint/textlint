# Change comparison

[日本語](requirements.ja.md)

## About this document

The change comparison runs two builds of textlint, the base (such as `master`) and the head (a pull request), on the same documents, and shows the differences: the lint results, the run time of the CLI, the time of each parser and of the traversal, the profile of each build, and where the CPU time goes.
It lets the author, an AI agent, and a reviewer see the effect of a change to a parser, the kernel, or another part on the hot path before the change is merged.
One script does the comparison. A developer and an AI agent run it locally, and CI runs the same script for each pull request and puts its output in the job summary.
The parent Product is [textlint](../../product.md). The phases, parsers, and rules of a run come from [Performance profile](../performance-profile/requirements.md).

### Scope

- The comparison script: its inputs, the sets of documents it uses, and its output as Markdown, JSON, and CPU profiles
- The measurement of the parsers and of the traversal without the CLI
- The CI job that runs the script for a pull request, including a pull request from a fork
- The instruction for AI agents to run the script and to put its output in the pull request

### Out of scope

- Deciding if a change is acceptable. The comparison shows differences; a person decides.
- Failing CI because of a difference. CI shows the result and does not fail on it.
- A comment on the pull request. It can be added later on top of the output of this feature.
- The benchmark of `master` that records a history of run times (the `benchmark` job of `ci.yml`).
- The speed of the rules. The rules are used as a fixed, realistic load; their own performance belongs to their repositories.

## User stories

### See what a change to a parser or the kernel does before opening a pull request

As a developer or an AI agent that changes a parser, the traversal, or another part on the hot path, I want one command that compares my branch with `master` so that I can put the differences in the description of the pull request.

**Acceptance criteria:**

Scenario: When the head makes the Markdown parser faster, the output shows it for the parser

- Given: The head changes `@textlint/markdown-to-ast` to parse faster, and the base is `master`.
- When: The developer runs the comparison script with the medium set.
- Then: The Markdown output shows the time of the Markdown parser for the base and the head with their ratio, and the functions of the parser that take the most CPU time in each build.

Scenario: When the head changes the lint results, the output lists the changed messages

- Given: The head changes a parser so that a rule reports a message at another column.
- When: The developer runs the comparison script.
- Then: The output says that the lint results changed, and lists the removed and the added messages with the rule id, the file, the line, the column, and the message.

Scenario: When the head does not change the lint, the output says that nothing changed

- Given: The head changes only documentation.
- When: The developer runs the comparison script.
- Then: The output says that the lint results are the same, and shows the times of the base and the head without a warning.

### Notice a large change in a pull request from someone else

As a maintainer who reviews a pull request from a fork, I want CI to run the comparison so that I do not need to build and benchmark the pull request locally.

**Acceptance criteria:**

Scenario: When a pull request changes a package, CI puts the comparison in the job summary

- Given: A pull request from a fork changes `@textlint/kernel`.
- When: CI runs for the pull request.
- Then: The job summary has the Markdown output of the comparison, and the run has the JSON output and the CPU profiles as artifacts. CI passes or fails only by the other checks.

Scenario: When the code of a pull request is malicious, it gets no secret and no write access

- Given: A pull request from a fork changes the comparison script to print the environment and to push to the repository.
- When: CI runs the comparison for the pull request.
- Then: The job has no secret of the repository and a token that can only read. The push fails, and nothing outside the run is changed.

Scenario: When a pull request changes only files that do not affect the lint, the comparison does not run

- Given: A pull request changes only Markdown files under `docs/`.
- When: CI runs for the pull request.
- Then: The comparison workflow does not run.

### Look at a CPU profile of the slow part

As a developer who investigates a slowdown, I want the CPU profiles of the runs so that I can open them in a profiler and find the function that got slower.

**Acceptance criteria:**

Scenario: When the comparison finishes, the CPU profiles are kept

- Given: The comparison has run.
- When: The developer opens the output directory or the artifact of CI.
- Then: It has a CPU profile of the CLI run, of the parsers, and of the traversal for each build, in the format that Chrome DevTools opens.

### Read the comparison from an AI agent

As an AI agent that reviews a pull request or investigates a slowdown, I want the comparison as JSON so that I can read the numbers without parsing a table.

**Acceptance criteria:**

Scenario: When the comparison finishes, the JSON has the base, the head, and the differences

- Given: The comparison has run.
- When: The agent reads the JSON output.
- Then: The JSON has the commits of the base and the head, the set of documents, the lint results that only one build has, the run times, the times of the parsers and the traversal, the profile of each build, and the CPU time of each package.

### Measure on a large set of documents

As a developer of the core, I want to run the comparison on sets of about 5, 90, 1,000, and 10,000 documents so that I can see how a change scales.

**Acceptance criteria:**

Scenario: When a larger set is selected, the script prepares the documents at a fixed commit

- Given: The set of about 10,000 documents is selected and is not on the machine.
- When: The developer runs the comparison script with that set.
- Then: The script downloads the documents of the repository at the commit that the script defines, and the next run uses the downloaded files without downloading them again.

## KPIs

None. No metric is defined for this feature.

## Functional requirements

### Comparison script

**Overview:** Builds or uses two builds of textlint, runs both on the same set of documents, and writes the differences.

**Input:** The base (a Git ref, `master` by default), the head (the working tree by default), the sets of documents, and what to measure (the CLI, the benchmarks without the CLI, or both; both by default).

**Output:** Markdown on the standard output, and JSON, Markdown, and CPU profiles in an output directory.

#### Applicable conditions

##### What is compared

| Item | Source | Why |
| --- | --- | --- |
| Lint results | The JSON results of the CLI of each build | A change on the hot path must not change what the rules report, unless it is meant to. The same documents give the same results in each run, so a difference is a change of the code |
| Run time of the CLI | Each build runs several times, the base and the head in turns | It is the time that a user sees. It changes between runs, so only a large ratio is marked |
| Time of each parser | Each built-in parser parses all documents of the set in one process, several times | The parse time without the rest of the CLI. It is less noisy than the CLI, so a smaller ratio is marked |
| Time of the traversal | The kernel lints all documents with a rule that listens to every node type and does nothing, in one process, several times. The parse time is subtracted | The cost of walking the tree and calling listeners, without the cost of the rules |
| Profile | [Performance profile](../performance-profile/requirements.md) of one run of each build | Where the time of a run goes, side by side. It comes from one run, so it is shown for reading and does not decide what changed |
| CPU time of each package | A CPU profile of one run of the CLI of each build | Whether the time moved between textlint, the rules, and other dependencies |

The runs that are timed (the CLI, the parsers, and the traversal) run one at a time, the base and the head in turns, so a change of the machine during the comparison affects both builds.
The preparation (the builds and the download of the sets) and the runs that are not timed (the profile and the CPU profiles) run at the same time as each other, before the timed runs, so the comparison takes less time and the timed runs are not disturbed.
A comparison that measures only the CLI or only the benchmarks without the CLI shows what it measured, and does not say that the lint results are the same when it did not compare them.

The output starts with what changed, so a reader sees at a glance whether anything changed, and then shows the details.
When the base does not have `--profile`, the profile of the base is shown as missing and the other items are compared.

##### Sets of documents

The sets are documents at fixed commits, so the base and the head and two runs on different days lint the same documents.

| Set | Documents | Files |
| --- | --- | --- |
| small | `test/benchmark/examples` (in this repository) | about 5 |
| medium | the Japanese book js-primer | about 90 |
| large | the Japanese translation of the JavaScript documentation of MDN | about 1,000 |
| huge | the Japanese translation of MDN | about 10,000 |

All sets are Markdown in Japanese, because the rules of the comparison check Japanese.
A local run and CI use all sets. A developer can select some of the sets for a quicker local run.
A set that is not on the machine is downloaded at its commit without the history of the repository, so preparing all sets takes a short time once.

The configuration of the lint is the rules of `preset-jtf-style`: they check every sentence with regular expressions, so the work of textlint itself is a large part of a run.

##### Thresholds

The script shows the time of each build and the ratio of the head to the base: the median of the runs for the CLI, and the fastest run for the parsers and the traversal, because the noise of a machine only makes a run slower.
For the CLI, a ratio of 1.3 or more, or 0.77 or less, is marked as a large change, because the run time of a process on a shared machine changes by more than 10% between runs.
For the parsers and the traversal, which run in one process after warm-up, a ratio of 1.1 or more, or 0.91 or less, is marked.
A time below 1 ms is not marked, because it is too short to tell a change from noise.

#### Exceptional behavior

##### A build fails

The script stops and prints which build failed. No partial comparison is written.

### CI job

**Overview:** Runs the comparison script for a pull request and puts the output in the job summary.

**Input:** A pull request that changes the packages, their dependencies, or the comparison itself.

**Output:** The job summary with the Markdown output, and artifacts with the JSON output and the CPU profiles.

#### Applicable conditions

The job runs the code of the pull request without any secret of the repository and with permission only to read the repository, so the code of a pull request from a fork can not get a secret or change the repository.
The base is the base commit of the pull request. CI compares each set in its own job, so the sets run in parallel, and a set that can not run does not hide the results of the other sets. The set of about 10,000 documents takes the longest, so two jobs compare it: one measures the CLI, and the other the parsers and the traversal. One more job puts the results of all sets in one job summary, and shows the two results of that set as one set.
The job does not fail because of a difference. It fails only if the comparison can not run.

#### Exceptional behavior

##### The comparison can not run

The job fails with the error, and the other checks of the pull request are not affected.

### Instruction for AI agents

**Overview:** AGENTS.md and a skill for AI agents tell an agent to run the comparison script for a change of a parser, the kernel, or other code on the hot path, to read the result, and to put the Markdown output in the description of the pull request.

#### Applicable conditions

The instruction tells the agent which set to use for a quick check and which for a final check, how to find the slow part with `--profile` and the CPU profiles, and not to call a difference within the thresholds an improvement.

## Data requirements

### Required data

- **Comparison result:** the commits of the base and the head, the sets, the lint results that differ, the run times, the times of the parsers and the traversal, the profiles, and the CPU time of each package and function. It is written for each run and is kept as an artifact of CI for the retention period of the repository.
- **CPU profiles:** one for the CLI, the parsers, and the traversal of each build and set.
- **Downloaded documents:** the files of a set at its fixed commit, kept on the machine to be reused.

### Relationships

A comparison result has two profiles of [Performance profile](../performance-profile/requirements.md) for each set, one for each build.

### Personal information

None is collected. The result has file paths of public repositories and the messages of rules about them.

## External service dependencies

- **GitHub Actions**
  - **Related user stories:** Notice a large change in a pull request from someone else; Read the comparison from an AI agent
  - **Reason for dependency:** It runs the comparison for each pull request and keeps the JSON output and the CPU profiles as artifacts
  - **Contractual and usage decisions:** The jobs use the hosted runners that the other checks of the repository use. The comparison builds two builds in each of five jobs, so it adds runner time to a pull request that changes a package
- **GitHub**
  - **Related user stories:** Measure on a large set of documents
  - **Reason for dependency:** The sets other than small are public repositories on GitHub, downloaded at their fixed commits
  - **Contractual and usage decisions:** Only public repositories are downloaded. Their documents are linted and not redistributed

## Security considerations

The code of a pull request from a fork is run by the CI job, so the job must not have anything that the code can steal or change: no secret of the repository, and a token that can only read.
A job that has a secret or write access, such as one that comments on the pull request, must not run the code of the pull request, and must treat the output of the comparison as untrusted data.

## Open questions

- **Thresholds:** The ratios that mark a change (1.3 for the CLI, 1.1 for the parsers and the traversal) are chosen from the noise of runs on shared machines. Interim treatment: use them as they are. Revisit when CI marks changes that do not reproduce, or misses changes that do. azu decides.
