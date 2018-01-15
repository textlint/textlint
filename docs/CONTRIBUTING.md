---
id: contributing
title: Contributing Guideline
---

## Monorepo

This repository is monorepo.
This repository includes multiple packages.

## Bug Reporting

If you found a bug, please [create a new issue](https://github.com/textlint/textlint/issues/new) on GitHub. Be sure to include the following information:

- The version of `textlint -v`
- Reproduce steps
- Actual result
    - Attach the log of `textlint --debug <options>`
- Expected result

:information_source: Creating reproduce repository help us to resolve the issue :)

- Example of reproduce repository
- [azu/textlint-isssue78: https://github.com/textlint/textlint/issues/78](https://github.com/azu/textlint-isssue78 "azu/textlint-isssue78: https://github.com/textlint/textlint/issues/78")

## For beginner

If you want to contribute to texltlint, let's see issues with the [`good first issue`](https://github.com/textlint/textlint/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) label.

We recommend these issues for your first contribution.

## Pull Request

### [Git Commit Message Format](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular  "Commit Message Format")

We use AngularJS Commit Convention.

Please see [Commit Message Format](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular  "Commit Message Format") for detail.

```
                       component        commit title
        commit type       /                /      
                \        |                |
                 feat(rule-context): add template url parameter to events

        body ->  The 'src` (i.e. the url of the template to load) is now provided to the
                 `$includeContentRequested`, `$includeContentLoaded` and `$includeContentError`
                 events.

 referenced  ->  Closes #8453
 issues          Closes #8454
```

- `commit type`: feat | fix | docs | style | perf | test | chore
    - `chore` is useful type
- `component`: package name or file name
    - e.g.) `textlint`, `kernel`, `ast-node-types`
    
    
Example commit messages

```
feat(rule): context.report support index-based position

support following syntax

e.g.) 
context.report(node, new RuleError({ index: index }));

fix #134
```


### Fixing document

If you want to fix `docs/`

1. Fix document!
2. Commit your changes
  - `git commit -am 'docs(<file-name>): Short description'`
3. During your first run after clone (`git clone`) or clean up (`npm run clean`), build the project
  - `npm run build`
4. Run the tests
  - `npm run test:docs`
5. Submit a pull request :D

Welcome to fix the document!

### Fixing bugs in code

textlint follows a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md "monorepo") approach, so textlint use [Lerna](https://lernajs.io/ "Lerna").

If you want to fix `src/` or `test/` in each packages.

1. Fix the bug in code!
2. Commit your changes
  - `git commit -am 'fix(<file-name>): Short description'`
3. Run the tests
  - `npm test`
4. Submit a pull request :D

Adding :new: feature in the same way.

1. Add feature
2. Commit your changes
  - `git commit -am 'feat(<file-name>): Short description'`
3. Write tests
4. Run the tests
  - `npm test`
5. Submit a pull request :D

### Install

We use yarn as package manager.

Please [install yarn](https://yarnpkg.com/lang/en/docs/install/) before starting development.

```sh
git clone --recursive {YOUR_FORKED_REPOSITORY}
cd {YOUR_FORKED_REPOSITORY}
yarn install
yarn run bootstrap
```

### Testing

This repository has three type tests.
You should run **Unit Test** before submit to Pull Request.

- Unit Test – Run [packages/*](../packages/) tests
- Example Test – Run [examples/*](../examples/) as test
- Integration Test – Run [Integration test](../test/integration-test)

#### Unit Test

Test all [packages/*](../packages/)'s tests.

```sh
yarn test
```

You can run unit test in each package.

```sh
cd pacakges/<pacakge>
yarn test
```

#### Example Test

Test [examples/*](../examples/) as test.

```sh
yarn run test:examples
```

#### Integration Test

Run [Integration test](../test/integration-test) that use actual textlint user project.
This test is heavy.

```sh
# Require git submodule
git submodule update --init
# Run test
yarn run test:integration
```

#### Documentation Test

Documentation including [`README.md`](../README.md), [`.github/`](../.github/), and [`docs/`](../docs) can be tested by:

```sh
yarn run test:docs
```

#### All Tests

Run **Unit test** + **Example test** + **Integration test** by following command.

This test is heavy because this includes Integration testing.

```sh
yarn run test:all
```

#### Coding Style

The repository use [ESLint](https://eslint.org/ "ESLint").

You can run lint:

```sh
yarn run eslint
```

It's possible that fix some wrong style using [--fix](https://eslint.org/docs/user-guide/command-line-interface#--fix "--fix") feature of ESLint:

```
yarn run eslint:fix
```
