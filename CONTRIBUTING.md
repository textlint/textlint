# Contributing Guide

## Bug Reporting

If you found a bug, please [create a new issue](https://github.com/textlint/textlint/issues/new) on GitHub. Be sure to include the following information:

- The version of `textlint -v`
- Reproduce steps
- Actual result
- Expected result

:information_source: Creating reproduce repository help us to resolve the issue :)

- Example of reproduce repository
- [azu/textlint-isssue78: https://github.com/textlint/textlint/issues/78](https://github.com/azu/textlint-isssue78 "azu/textlint-isssue78: https://github.com/textlint/textlint/issues/78")

## Pull Request

### [Git Commit Message Format](https://github.com/stevemao/conventional-changelog-angular/blob/master/convention.md "Commit Message Format")

We use AngularJS Commit Convention.

Please see [Commit Message Format](https://github.com/stevemao/conventional-changelog-angular/blob/master/convention.md "Commit Message Format") for detail.

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
- `component`: always file name without ext or directory name
    - e.g.) `rule-error`, `core`, `engine`
    
    
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
3. Run the tests
  - `npm run lint:doc`
4. Submit a pull request :D

Welcome to fix the document!

### Fixing bugs in code

If you want to fix `src/` or `test/`, `example/`.

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

#### Testing

Run testing:

```sh
npm test
```

#### Coding Style

The repository use [ESLint](http://eslint.org/ "ESLint").

You can run lint:

```sh
npm run lint:js
```

It's possible that fix some wrong style using [--fix](http://eslint.org/docs/user-guide/command-line-interface#fix "--fix") feature of ESLint:

```
$(npm bin)/eslint --fix src/
```
