# Rule creation once

[日本語](requirements.ja.md)

## About this document

A rule usually creates its listeners for every file: textlint calls the rule function with a new context, and the rule returns new listener functions.
When a run lints thousands of files with dozens of rules, this creation and the garbage it leaves become a visible part of the run.
Rule creation once lets a rule create its listeners one time and reuse them for every file.
The root of every TxtAST is `Document`, so the `Document` and `Document:exit` listeners already run at the start and the end of each file, and the rule resets its state there.
The rule opts in with `createOnce`, so rules that do not have it work as before.
The parent Product is [textlint](../../product.md).

### Scope

- The `createOnce` property of a rule function, and how textlint finds it on a rule module and on the `linter` and `fixer` functions of a fixable rule
- Resetting the state of a rule for each file with the `Document` listener
- The context that `createOnce` receives, and which file its methods refer to
- How long a created rule is reused
- Rules whose listeners must finish synchronously
- A rule that works on textlint versions without `createOnce`

### Out of scope

- Filter rules. They are created for every file as before.
- Asynchronous rules. A rule whose listeners return a Promise keeps the rule function without `createOnce`.
- Hooks before and after a file, such as `before` and `after` of other linters. The `Document` and `Document:exit` listeners have this role.
- Skipping a file or a rule for files that have no node the rule listens to.
- A helper package that converts rules. A rule can write the delegating function by itself.

## User stories

### Make a rule cheaper to run on many files

As a rule author, I want to create my listeners one time so that a run over many files does not pay for creating them for every file.

**Acceptance criteria:**

Scenario: When a rule has `createOnce`, it is called one time for a run over many files

- Given: A rule function has `createOnce`, and the configuration enables the rule.
- When: The writer runs `textlint` on a directory with 100 Markdown files.
- Then: `createOnce` is called one time. The rule function itself is not called. The listeners that `createOnce` returned are called for the nodes of every file, and the messages are the same as when the rule function is called for every file.

Scenario: When the same rule is enabled with two different options, each is created one time

- Given: A preset enables the same rule module twice with different options.
- When: The writer runs `textlint` on a directory with 10 files.
- Then: `createOnce` is called two times, once with each options. Each created rule reports with its own rule id.

Scenario: When a program calls the kernel with new rule objects for each text, the rule is created for each text

- Given: A program calls `TextlintKernel#lintText` for two texts, each time with a new `rules` array of new objects.
- When: The program lints the two texts.
- Then: `createOnce` is called once for each text. The messages are the same as with the same objects.

### Reset the state of a rule for each file

As a rule author whose rule counts something in a file, I want to reset the state at the start of each file so that the state of one file does not leak into the next file.

**Acceptance criteria:**

Scenario: When the `Document` listener resets a counter, every file starts from zero

- Given: A rule with `createOnce` counts headings, resets the count in its `Document` listener, and reports in its `Document:exit` listener when the count is more than 10.
- When: The writer lints two files with 6 headings each.
- Then: No message is reported for either file.

Scenario: When a file has no other node the rule listens to, the `Document` listeners still run

- Given: A rule with `createOnce` listens to `Table` and to `Document:exit`, and reports one message in `Document:exit` for every file.
- When: The writer lints a file without tables.
- Then: The file has the one message from `Document:exit`.

### Report from the context of the current file

As a rule author, I want `context` methods to refer to the file being linted so that I can keep the context that `createOnce` received.

**Acceptance criteria:**

Scenario: When a listener calls `report`, the message belongs to the current file

- Given: A rule with `createOnce` keeps `context.report` and `context.getSource` in variables.
- When: The writer lints two files, and the rule reports in both.
- Then: Each message is in the result of the file whose node was reported, with the line and column in that file. `getSource()` returns the text of that file.

Scenario: When `createOnce` calls a method that needs a file, an error names the rule

- Given: A rule calls `context.getSource()` in the body of `createOnce`, outside its listeners.
- When: The writer runs `textlint`.
- Then: The run fails with an error that names the rule id and says that the method can be called only in a listener.

Scenario: When `createOnce` reads values that do not depend on a file, they are available

- Given: A rule reads `context.Syntax`, `context.RuleError`, `context.fixer`, `context.locator`, `context.id`, and `context.severity` in the body of `createOnce`.
- When: The writer runs `textlint`.
- Then: The values are the same as in a rule function without `createOnce`, and the run succeeds.

### Keep asynchronous rules from reporting to the wrong file

As a writer, I want a rule with `createOnce` that returns a Promise to fail clearly so that its messages never go to another file.

**Acceptance criteria:**

Scenario: When a listener of a rule with `createOnce` returns a Promise, the lint fails with an error

- Given: A rule with `createOnce` has a listener that returns a Promise.
- When: The writer lints a file that has the node.
- Then: The lint of the file fails with an error that names the rule id and says that listeners of `createOnce` must be synchronous. No message of the rule is in another file.

### Publish one rule for old and new textlint

As a rule author, I want my rule to work on textlint versions without `createOnce` so that users do not have to update textlint to use the new version of my rule.

**Acceptance criteria:**

Scenario: When the rule function delegates to `createOnce`, an old textlint runs it for every file

- Given: A rule function returns `createOnce(context, options)`, and has `createOnce` as a property.
- When: A textlint version without `createOnce` lints two files.
- Then: The messages are the same as on a textlint version with `createOnce`.

### Fix with a rule created once

As a writer, I want `textlint --fix` to work with rules that have `createOnce` so that fixable rules can use it too.

**Acceptance criteria:**

Scenario: When a fixable rule has `createOnce` on `linter` and `fixer`, `--fix` applies its fixes

- Given: A fixable rule has `createOnce` on its `linter` and `fixer` functions.
- When: The writer runs `textlint --fix` on a file with two errors the rule can fix.
- Then: The file is fixed, and the output is the same as with the rule without `createOnce`.

## KPIs

### Run time with rules that create once

- **Target value:** A run of the huge set of [Change comparison](../change-comparison/requirements.md) with preset-jtf-style is faster when its rules have `createOnce` than when they do not, by more than the difference between two series of runs of the same build.
- **Measurement method:** Lint the same documents with the same build and two versions of the rules, in turns, and compare the median run times.
- **Measurement period:** When a preset adopts `createOnce`.

## Functional requirements

### Create a rule once

**Overview:** textlint calls `createOnce(context, options)` of a rule one time and reuses the returned object for every file.

**Input:** A rule module whose rule function, or whose `linter` and `fixer` functions, has a `createOnce` function as a property. The options of the rule from the configuration.

**Output:** The messages of each file, as with a rule function called for each file.

#### Applicable conditions

##### Which function textlint uses

textlint uses `createOnce` when the function that it would call for the file has a `createOnce` property that is a function.
For a fixable rule, the lint uses `createOnce` of `linter`, and the fix uses `createOnce` of `fixer`. They are created separately.
When the property is missing, textlint calls the rule function for every file, as before.

##### How long a created rule is reused

A created rule is reused while the same kernel lints with the same rule entry object, which holds the rule and its options.
The CLI and `createLinter` pass the same entries for every file, so a run creates each rule once.
A new entry creates the rule again.

##### Listeners

The object that `createOnce` returns has listeners by node type, as a rule function returns.
textlint calls them for the nodes of every file.
A rule that keeps state for a file resets it in the `Document` listener, which runs first for every file, and finishes it in the `Document:exit` listener, which runs last.

##### Context

The context that `createOnce` receives is the same object for every file.
`id`, `severity`, `Syntax`, `RuleError`, `fixer`, and `locator` do not depend on a file and can be used anywhere.
`report`, `getSource`, `getFilePath`, and `getConfigBaseDir` refer to the file being linted, and can be used in listeners.

##### Synchronous listeners

The kernel lints many files at the same time, and the context refers to one file at a time.
The listeners of a rule with `createOnce` must finish synchronously.

#### Exceptional behavior

##### A file method is called outside a file

When `report`, `getSource`, `getFilePath`, or `getConfigBaseDir` is called while no file of the rule is being linted, it throws an error with the rule id. The run fails as with any error thrown in a rule.

##### A listener returns a Promise

When a listener of a rule with `createOnce` returns a thenable, the lint of the file fails with an error that names the rule id.

##### `createOnce` throws

When `createOnce` throws, the error message names the rule, as for a rule function that throws. textlint calls `createOnce` again for the next file, because nothing was created.

## Data requirements

### Required data

- **Created rule:** The object that `createOnce` returned and its context, kept by the kernel for a rule entry while the entry is used.

### Relationships

A created rule belongs to one kernel and one rule entry. A fixable rule has one created rule for lint and one for fix.

### Personal information

None.

## External service dependencies

None.

## Open questions

- **A helper for old textlint versions:** The delegating function is a few lines, and the rule writes it by itself. Interim: documented in the rule guide. Revisit when many rules adopt `createOnce` and copy the same code. azu decides where a helper would live.
