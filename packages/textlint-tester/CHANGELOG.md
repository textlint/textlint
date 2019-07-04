# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="5.1.7"></a>
## [5.1.7](https://github.com/textlint/textlint/compare/textlint-tester@5.1.6...textlint-tester@5.1.7) (2019-07-04)

**Note:** Version bump only for package textlint-tester





<a name="5.1.6"></a>
## [5.1.6](https://github.com/textlint/textlint/compare/textlint-tester@5.1.5...textlint-tester@5.1.6) (2019-04-30)


### Chores

* **deps:** update deps && devDeps ([a19463b](https://github.com/textlint/textlint/commit/a19463b))





<a name="5.1.5"></a>
## [5.1.5](https://github.com/textlint/textlint/compare/textlint-tester@5.1.4...textlint-tester@5.1.5) (2019-04-30)

**Note:** Version bump only for package textlint-tester





<a name="5.1.4"></a>
## [5.1.4](https://github.com/textlint/textlint/compare/textlint-tester@5.1.3...textlint-tester@5.1.4) (2019-02-10)

**Note:** Version bump only for package textlint-tester





<a name="5.1.3"></a>
## [5.1.3](https://github.com/textlint/textlint/compare/textlint-tester@5.1.2...textlint-tester@5.1.3) (2019-02-10)

**Note:** Version bump only for package textlint-tester





<a name="5.1.2"></a>
## [5.1.2](https://github.com/textlint/textlint/compare/textlint-tester@5.1.1...textlint-tester@5.1.2) (2019-01-03)


### Tests

* **tester:** add other type test ([2a3b55f](https://github.com/textlint/textlint/commit/2a3b55f))





<a name="5.1.1"></a>
## [5.1.1](https://github.com/textlint/textlint/compare/textlint-tester@5.1.0...textlint-tester@5.1.1) (2019-01-03)


### Bug Fixes

* **types:** enhance `TextlintRuleReportHandler` typing ([aa354d1](https://github.com/textlint/textlint/commit/aa354d1))





<a name="5.1.0"></a>
# [5.1.0](https://github.com/textlint/textlint/compare/textlint-tester@5.0.2...textlint-tester@5.1.0) (2019-01-01)


### Chores

* **deps:** update eslint deps ([5bf2d38](https://github.com/textlint/textlint/commit/5bf2d38))
* **deps:** update TypeScript deps ([3ea7fb0](https://github.com/textlint/textlint/commit/3ea7fb0))


### Styles

* **eslint:** apply eslint to all files ([6a9573f](https://github.com/textlint/textlint/commit/6a9573f))


### Tests

* **deps:** update no-todo rule reference ([6cecc88](https://github.com/textlint/textlint/commit/6cecc88))




<a name="5.0.2"></a>
## [5.0.2](https://github.com/textlint/textlint/compare/textlint-tester@5.0.0...textlint-tester@5.0.2) (2018-12-24)


### Bug Fixes

* **textlint-tester:** fix text only valid test is always passed ([#551](https://github.com/textlint/textlint/issues/551)) ([c104007](https://github.com/textlint/textlint/commit/c104007))




<a name="5.0.1"></a>
## [5.0.1](https://github.com/textlint/textlint/compare/textlint-tester@5.0.0...textlint-tester@5.0.1) (2018-10-12)


### Bug Fixes

* **textlint-tester:** fix text only valid test is always passed ([#551](https://github.com/textlint/textlint/issues/551)) ([c104007](https://github.com/textlint/textlint/commit/c104007))




<a name="5.0.0"></a>
# [5.0.0](https://github.com/textlint/textlint/compare/textlint-tester@4.1.3...textlint-tester@5.0.0) (2018-07-22)


### Bug Fixes

* **kernel:** make rule and plugin's option value {} by default ([b7aa63d](https://github.com/textlint/textlint/commit/b7aa63d))


### Chores

* **deps:** update mocha ([5df8af4](https://github.com/textlint/textlint/commit/5df8af4))


### Code Refactoring

* **kernel:** separate linter and fixer descriptor ([b5bc8bd](https://github.com/textlint/textlint/commit/b5bc8bd))


### BREAKING CHANGES

* **kernel:** Previously, textlint pass `true` to rule and plugin as default value of option.
This commit change the default value to `{}` (empty object).

fix https://github.com/textlint/textlint/issues/535




<a name="4.1.3"></a>
## [4.1.3](https://github.com/textlint/textlint/compare/textlint-tester@4.1.2...textlint-tester@4.1.3) (2018-04-02)




**Note:** Version bump only for package textlint-tester

<a name="4.1.2"></a>
## [4.1.2](https://github.com/textlint/textlint/compare/textlint-tester@4.1.1...textlint-tester@4.1.2) (2018-04-02)




**Note:** Version bump only for package textlint-tester

<a name="4.1.1"></a>
## [4.1.1](https://github.com/textlint/textlint/compare/textlint-tester@4.1.0...textlint-tester@4.1.1) (2018-03-25)


### Chores

* **test:** use `ts-node-test-register` for TypeScript testing ([be746d8](https://github.com/textlint/textlint/commit/be746d8)), closes [#451](https://github.com/textlint/textlint/issues/451)
* format ([d8f44db](https://github.com/textlint/textlint/commit/d8f44db))




<a name="4.1.0"></a>
# [4.1.0](https://github.com/textlint/textlint/compare/textlint-tester@4.0.6...textlint-tester@4.1.0) (2018-01-27)


### Bug Fixes

* **textlint-tester:** clarify when multiple options were found ([5ffe903](https://github.com/textlint/textlint/commit/5ffe903))
* **textlint-tester:** correct options handling for rules and plugins ([985d03a](https://github.com/textlint/textlint/commit/985d03a))
* **textlint-tester:** make `plugins` at `TestConfig` optional ([3ebc1d7](https://github.com/textlint/textlint/commit/3ebc1d7))


### Chores

* **textlint-tester:** add user-defined type guard ([77b0e95](https://github.com/textlint/textlint/commit/77b0e95))
* **textlint-tester:** improve codes according to review comments ([178ba8a](https://github.com/textlint/textlint/commit/178ba8a))
* **textlint-tester:** rename `TestTarget` to `TestConfig` ([59ed69d](https://github.com/textlint/textlint/commit/59ed69d))


### Documentation

* **textlint-tester:** update README ([46aed3f](https://github.com/textlint/textlint/commit/46aed3f))
* **textlint-tester:** update README with new function signature ([d419a15](https://github.com/textlint/textlint/commit/d419a15))


### Features

* **textlint-tester:** add multiple rules and plugins test support ([bedf761](https://github.com/textlint/textlint/commit/bedf761))


### Tests

* **textlint-tester:** add new style test case ([9e36143](https://github.com/textlint/textlint/commit/9e36143))
* **textlint-tester:** add valid test case which pass a TestConfig that has multiple rules only ([c02a1ec](https://github.com/textlint/textlint/commit/c02a1ec))
* **textlint-tester:** implement configuration assertion ([09c9db3](https://github.com/textlint/textlint/commit/09c9db3))




<a name="4.0.6"></a>
## [4.0.6](https://github.com/textlint/textlint/compare/textlint-tester@4.0.5...textlint-tester@4.0.6) (2018-01-18)


### Bug Fixes

* **tester:** fix "main" and "types" field in package.json ([567ba65](https://github.com/textlint/textlint/commit/567ba65))




<a name="4.0.5"></a>
## [4.0.5](https://github.com/textlint/textlint/compare/textlint-tester@4.0.4...textlint-tester@4.0.5) (2018-01-12)




**Note:** Version bump only for package textlint-tester

<a name="4.0.3"></a>
## [4.0.3](https://github.com/textlint/textlint/compare/textlint-tester@4.0.2...textlint-tester@4.0.3) (2017-12-31)




**Note:** Version bump only for package textlint-tester

<a name="4.0.2"></a>
## [4.0.2](https://github.com/textlint/textlint/compare/textlint-tester@4.0.1...textlint-tester@4.0.2) (2017-12-25)




**Note:** Version bump only for package textlint-tester

<a name="4.0.1"></a>
## [4.0.1](https://github.com/textlint/textlint/compare/textlint-tester@4.0.0...textlint-tester@4.0.1) (2017-12-19)


### Bug Fixes

* **textlint-tester:** Correct output ${text} ([d0ecbab](https://github.com/textlint/textlint/commit/d0ecbab))




<a name="4.0.0"></a>
# [4.0.0](https://github.com/textlint/textlint/compare/textlint-tester@4.0.0-next.2...textlint-tester@4.0.0) (2017-12-18)




**Note:** Version bump only for package textlint-tester

<a name="4.0.0-next.2"></a>
# [4.0.0-next.2](https://github.com/textlint/textlint/compare/textlint-tester@4.0.0-next.1...textlint-tester@4.0.0-next.2) (2017-12-18)


### Features

* **textlint-tester:** support `inputPath` option ([#394](https://github.com/textlint/textlint/issues/394)) ([9b8175f](https://github.com/textlint/textlint/commit/9b8175f))




<a name="4.0.0-next.1"></a>
# [4.0.0-next.1](https://github.com/textlint/textlint/compare/textlint-tester@4.0.0-next.0...textlint-tester@4.0.0-next.1) (2017-12-17)




**Note:** Version bump only for package textlint-tester

<a name="4.0.0-next.0"></a>
# [4.0.0-next.0](https://github.com/textlint/textlint/compare/textlint-tester@3.0.3...textlint-tester@4.0.0-next.0) (2017-12-15)




**Note:** Version bump only for package textlint-tester

<a name="3.0.3"></a>
## [3.0.3](https://github.com/textlint/textlint/compare/textlint-tester@3.0.2...textlint-tester@3.0.3) (2017-11-05)




**Note:** Version bump only for package textlint-tester

<a name="3.0.2"></a>
## [3.0.2](https://github.com/textlint/textlint/compare/textlint-tester@3.0.1...textlint-tester@3.0.2) (2017-11-03)




**Note:** Version bump only for package textlint-tester

<a name="3.0.0"></a>
# [3.0.0](https://github.com/textlint/textlint/compare/textlint-tester@3.0.0-beta.1...textlint-tester@3.0.0) (2017-10-28)




**Note:** Version bump only for package textlint-tester

<a name="2.2.4"></a>
## [2.2.4](https://github.com/textlint/textlint/compare/textlint-tester@2.2.3...textlint-tester@2.2.4) (2017-05-21)




<a name="2.2.3"></a>
## [2.2.3](https://github.com/textlint/textlint/compare/textlint-tester@2.2.2...textlint-tester@2.2.3) (2017-05-21)




<a name="2.2.2"></a>
## [2.2.2](https://github.com/textlint/textlint/compare/textlint-tester@2.2.1...textlint-tester@2.2.2) (2017-05-18)




<a name="2.2.1"></a>
## [2.2.1](https://github.com/textlint/textlint/compare/textlint-tester@2.2.0...textlint-tester@2.2.1) (2017-05-11)




<a name="2.2.0"></a>
# 2.2.0 (2017-05-07)


### Bug Fixes

* **npm:** fix description ([528d089](https://github.com/textlint/textlint/commit/528d089))
* **npm:** fix main and files ([66f05b4](https://github.com/textlint/textlint/commit/66f05b4))
* **npm:** fix version ([4fa4cc9](https://github.com/textlint/textlint/commit/4fa4cc9))
* **test:** fix invalid line detection ([c4883a7](https://github.com/textlint/textlint/commit/c4883a7))
* remove state test case ([38b556c](https://github.com/textlint/textlint/commit/38b556c))
* **test:** fix test ([5ec8cc8](https://github.com/textlint/textlint/commit/5ec8cc8))
* fix debug ([424da52](https://github.com/textlint/textlint/commit/424da52))
* **test:** fix Todo test ([b928de8](https://github.com/textlint/textlint/commit/b928de8))
* **tester:** allow to set empty text ([b7e0873](https://github.com/textlint/textlint/commit/b7e0873))
* **textlint-tester:** fix windows ([0541c07](https://github.com/textlint/textlint/commit/0541c07))
* remove state test ([a088bc9](https://github.com/textlint/textlint/commit/a088bc9))


### Features

* use mocha ([5589090](https://github.com/textlint/textlint/commit/5589090))
* **fixer:** add fixer teest support ([2b84eb7](https://github.com/textlint/textlint/commit/2b84eb7))
* **test:** add #testState case ([eedd0d2](https://github.com/textlint/textlint/commit/eedd0d2))
* **test:** add assertion to detect fixer function is available ([6ef0901](https://github.com/textlint/textlint/commit/6ef0901))
* **test:** check if is the `line` or `column` invalid ([e7e4ba4](https://github.com/textlint/textlint/commit/e7e4ba4))
* **textlint:** update textlint[@6](https://github.com/6) ([5b3f826](https://github.com/textlint/textlint/commit/5b3f826))
