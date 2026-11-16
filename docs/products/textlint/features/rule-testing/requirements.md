# Rule testing

[日本語](requirements.ja.md)

## About this document

Rule testing lets a rule author run the tests of a rule package with one command, `textlint-scripts test`.
The tests are usually written with `textlint-tester`, in JavaScript or TypeScript.
The parent Product is [textlint](../../product.md).

A rule package is small, and its author often maintains many of them.
The command has to keep working when the author updates `textlint-scripts`, without a change to each package.
It also has to stay small, so that a rule package does not pull a large test framework into its dependencies.

### Scope

- The `textlint-scripts test` command: which files it runs, how it transpiles them, how it type-checks TypeScript, and its exit code
- The test functions that a test file can use without importing them
- The register scripts `textlint-scripts/register` and `textlint-scripts/register-ts`, which other tools load to run the same files

### Out of scope

- How `textlint-tester` checks a rule. `textlint-tester` uses the test functions described here when they exist
- `textlint-scripts build` and `textlint-scripts init`
- Test runners that the author installs and runs directly, such as Mocha or Vitest

## User stories

### Test a rule package with one command

As a rule author, I want to run all tests of my rule package with `textlint-scripts test` so that I do not have to configure a test runner in each package.

**Acceptance criteria:**

Scenario: When the tests pass, the command succeeds

- Given: A rule package whose `test/` has test files written with `textlint-tester`, and every test passes
- When: The author runs `textlint-scripts test`
- Then: Each test is shown with its result, and the command exits with code 0

Scenario: When a test fails, the command fails

- Given: A rule package that has a test whose expected error does not match
- When: The author runs `textlint-scripts test`
- Then: The failing test, the expected value, and the actual value are shown, and the command exits with a non-zero code

Scenario: When a test file throws while it defines its tests, the command fails

- Given: A test file whose `describe` function throws, for example because `textlint-tester` rejects the options
- When: The author runs `textlint-scripts test`
- Then: The error is shown as a failing test, and the command exits with a non-zero code

### Write tests in TypeScript

As a rule author who writes in TypeScript, I want my tests and sources to be type-checked and run without a separate build so that a type error does not reach a release.

**Acceptance criteria:**

Scenario: When the project has a type error, the tests do not run

- Given: A rule package with `tsconfig.json`, and a type error in a source or test file
- When: The author runs `textlint-scripts test`
- Then: The type error is shown, no test runs, and the command exits with a non-zero code

Scenario: When the types are correct, TypeScript tests run without a build

- Given: A rule package with `tsconfig.json`, and `test/index.test.ts` that imports `../src/index` without a file extension
- When: The author runs `textlint-scripts test`
- Then: The tests in `test/index.test.ts` run against the sources in `src/`

### Keep existing tests working

As a rule author with many packages, I want tests written for the Mocha-based `textlint-scripts test` to keep passing so that I can update `textlint-scripts` without editing each package.

**Acceptance criteria:**

Scenario: When a test uses Mocha-style globals, it runs

- Given: A test file that uses `describe`, `it`, `before`, and `beforeEach` without importing them
- When: The author runs `textlint-scripts test`
- Then: The tests and hooks run in the same order as with Mocha

Scenario: When a test takes a `done` callback, the test waits for it

- Given: A test function `function (done) { setTimeout(done, 10); }`
- When: The author runs `textlint-scripts test`
- Then: The test passes after `done` is called, and fails when `done` is called with an error

Scenario: When the package has a Mocha config file, the author is told that it is not read

- Given: A rule package with `.mocharc.json`
- When: The author runs `textlint-scripts test`
- Then: A warning names the file and says to pass options as arguments, and the tests run

### Run the tests from an editor

As a rule author, I want to run one test file from my editor with the same transpilation so that I can debug a rule.

**Acceptance criteria:**

Scenario: When a test runner loads the register script, test files are transpiled

- Given: A test runner that the author installed, such as Mocha, started with `--require textlint-scripts/register`
- When: The runner loads a test file that uses `import` and TypeScript syntax
- Then: The file runs as it does with `textlint-scripts test`

Scenario: When both register scripts are loaded, the files are transpiled once

- Given: A test runner started with `--require textlint-scripts/register` and `--require textlint-scripts/register-ts`
- When: The runner loads a TypeScript test file
- Then: The file runs without an error about the code produced by a transpiler

## KPIs

### Existing rule packages that pass without changes

- **Target value:** Every rule package in the sample whose tests pass with the previous release also passes with the new release, with the same number of tests.
- **Measurement method:** Run `textlint-scripts test` with both releases on a sample of public rule packages that use it, including JavaScript and TypeScript packages, and compare the results.
- **Measurement period:** When `textlint-scripts test` changes how it runs or transpiles files.

### Test framework dependencies

- **Target value:** `textlint-scripts` depends on no test framework. Tests run on the test runner of Node.js.
- **Measurement method:** Read the `dependencies` and `peerDependencies` of the package.
- **Measurement period:** When dependencies of the package change.

## Functional requirements

### Run the tests of a rule package

`textlint-scripts test` runs the test files of the rule package in the current directory and exits with a non-zero code when any test fails.

#### Applicable conditions

##### Test files

- The test files are `test/**/*.js`. When `tsconfig.json` exists in the current directory, `test/**/*.ts` are test files too.
- Each test file runs on the test runner of Node.js (`node:test`), and the result of each test is shown.
- Arguments after `textlint-scripts test` are passed to the test runner of Node.js, such as `--test-timeout`, `--test-name-pattern`, and `--watch`.
- Each test times out after 10 seconds unless `--test-timeout` is given.

##### Transpilation

- Test files and the files that they import are transpiled when they are loaded, with the same Babel presets as `textlint-scripts build`.
- An `import` of a relative path without a file extension resolves to the `.js` or `.ts` file, as it does in `textlint-scripts build`.
- `__dirname` and `require` are available in a test file and in a source file that uses `import`.

##### Type checking

- When `tsconfig.json` exists, `tsc -p tsconfig.json` runs before the tests. When it fails, no test runs and the command exits with its exit code.
- The transpilation does not type-check, so the result of the tests does not depend on the type checker.

##### Test functions

The following functions are globals in a test file, unless another test framework has already defined them.

| Global | Behavior |
| --- | --- |
| `describe`, `context` | Defines a suite. `.only` and `.skip` are available |
| `it`, `specify` | Defines a test. `.only` and `.skip` are available |
| `before`, `after`, `beforeEach`, `afterEach` | Defines a hook of the current suite. A name as the first argument is allowed |

- A test or hook function that has a parameter is a callback-style function. It ends when the callback is called, and fails when the callback is called with an error.
- Inside a test or hook function, `this.skip()` skips the test, and `this.timeout()` and `this.slow()` do nothing.
- When a suite function throws, the error is a failing test of that suite.

#### Exceptional behavior

##### Mocha config files

`.mocharc.js`, `.mocharc.cjs`, `.mocharc.yaml`, `.mocharc.yml`, `.mocharc.jsonc`, `.mocharc.json`, and `test/mocha.opts` are not read.
When one of them exists, a warning names it and shows how to pass an option as an argument. The tests run as usual.

##### No test files

When no file matches the test file patterns, an error names the patterns, no test runs, and the command exits with a non-zero code.

### Provide register scripts

`textlint-scripts/register` installs the transpilation of [Transpilation](#transpilation) into the current Node.js process, so that another tool can load the same files.

#### Applicable conditions

- `textlint-scripts/register-ts` is the same as `textlint-scripts/register`. It does not type-check.
- Loading the register scripts more than once in a process installs the transpilation once.
- The register scripts do not define the test functions. A test runner loaded with them provides its own.

## Data requirements

### Required data

None. The command reads the test files, the source files, and `tsconfig.json` of the rule package.

### Relationships

None.

### Personal information

None.

## External service dependencies

None. The command does not use the network.

## Security considerations

The command runs the code of the rule package and its dependencies with the permissions of the author.
It runs only the files of the current directory that match the test file patterns and the files that they import.

## Open questions

- **Running TypeScript without Babel:** Node.js can run TypeScript by removing types, but it does not resolve an `import` without a file extension, and a file that uses `import` has no `__dirname`. Most rule packages depend on both. Until rule packages can move without editing each file, Babel transpiles the files. Revisit when a migration tool can rewrite these imports and `__dirname`, or when `textlint-scripts build` stops using Babel. azu decides.
- **Test functions in `textlint-tester`:** `textlint-tester` uses the global `describe` and `it` when they exist and runs the checks directly otherwise. Until `textlint-tester` uses `node:test` itself, `textlint-scripts test` provides the globals. Revisit when `textlint-tester` changes how it defines tests. azu decides.
