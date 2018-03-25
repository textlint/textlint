# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="10.1.5"></a>
## [10.1.5](https://github.com/textlint/textlint/compare/textlint@10.1.4...textlint@10.1.5) (2018-03-25)


### Bug Fixes

* **textlint:** remove utf-8-validate ([7668c1b](https://github.com/textlint/textlint/commit/7668c1b))


### Chores

* **test:** use `ts-node-test-register` for TypeScript testing ([be746d8](https://github.com/textlint/textlint/commit/be746d8)), closes [#451](https://github.com/textlint/textlint/issues/451)




<a name="10.1.4"></a>
## [10.1.4](https://github.com/textlint/textlint/compare/textlint@10.1.3...textlint@10.1.4) (2018-01-27)


### Code Refactoring

* **ast-traverse:** update usage of [@textlint](https://github.com/textlint)/ast-traverse ([133ab5a](https://github.com/textlint/textlint/commit/133ab5a))
* **plugin-markdown:** update usage of [@textlint](https://github.com/textlint)/textlint-plugin-markdown ([d34ee08](https://github.com/textlint/textlint/commit/d34ee08))
* **plugin-text:** update usage of [@textlint](https://github.com/textlint)/textlint-plugin-text ([b040b33](https://github.com/textlint/textlint/commit/b040b33))


### Tests

* **textlint:** add non-scoped case to module-resolver ([5eeaa02](https://github.com/textlint/textlint/commit/5eeaa02))




<a name="10.1.3"></a>
## [10.1.3](https://github.com/textlint/textlint/compare/textlint@10.1.2...textlint@10.1.3) (2018-01-18)




**Note:** Version bump only for package textlint

<a name="10.1.2"></a>
## [10.1.2](https://github.com/textlint/textlint/compare/textlint@10.1.1...textlint@10.1.2) (2018-01-12)




**Note:** Version bump only for package textlint

<a name="10.1.0"></a>
# [10.1.0](https://github.com/textlint/textlint/compare/textlint@10.0.1...textlint@10.1.0) (2017-12-25)


### Bug Fixes

* **textlint:** Return an exit status when no rules found ([#408](https://github.com/textlint/textlint/issues/408)) ([3dc76e4](https://github.com/textlint/textlint/commit/3dc76e4)), closes [#406](https://github.com/textlint/textlint/issues/406)


### Features

* **textlint:** show available formatter in help ([af6b0da](https://github.com/textlint/textlint/commit/af6b0da)), closes [#85](https://github.com/textlint/textlint/issues/85)




<a name="10.0.1"></a>
## [10.0.1](https://github.com/textlint/textlint/compare/textlint@10.0.0...textlint@10.0.1) (2017-12-19)


### Bug Fixes

* **textlint:** throw an error if file is not encoded in UTF8 ([dfe7e28](https://github.com/textlint/textlint/commit/dfe7e28))




<a name="10.0.0"></a>
# [10.0.0](https://github.com/textlint/textlint/compare/textlint@10.0.0-next.2...textlint@10.0.0) (2017-12-18)




**Note:** Version bump only for package textlint

<a name="10.0.0-next.2"></a>
# [10.0.0-next.2](https://github.com/textlint/textlint/compare/textlint@10.0.0-next.1...textlint@10.0.0-next.2) (2017-12-18)




**Note:** Version bump only for package textlint

<a name="10.0.0-next.1"></a>
# [10.0.0-next.1](https://github.com/textlint/textlint/compare/textlint@10.0.0-next.0...textlint@10.0.0-next.1) (2017-12-17)


### Bug Fixes

* **textlint:** Replace pkg-conf with read-pkg-up to get package version ([e3e6197](https://github.com/textlint/textlint/commit/e3e6197))
* **textlint:** use read-pkg-up to get package version ([c1aeaa2](https://github.com/textlint/textlint/commit/c1aeaa2)), closes [#388](https://github.com/textlint/textlint/issues/388)




<a name="10.0.0-next.0"></a>
# [10.0.0-next.0](https://github.com/textlint/textlint/compare/textlint@9.1.1...textlint@10.0.0-next.0) (2017-12-15)


### Bug Fixes

* **textlint:** fix bin/cli.js ([3e0f103](https://github.com/textlint/textlint/commit/3e0f103))
* **textlint:** fix build temp ([a0bc1af](https://github.com/textlint/textlint/commit/a0bc1af))
* **textlint:** fix tsconfig resolution ([c2f588a](https://github.com/textlint/textlint/commit/c2f588a))
* **textlint:** move textlint-fixer-formatter from devDeps to deps ([#367](https://github.com/textlint/textlint/issues/367)) ([da23f71](https://github.com/textlint/textlint/commit/da23f71))
* **textlint:** overwrite tsconfig.json ([de60be3](https://github.com/textlint/textlint/commit/de60be3))
* **textlint:** support nest read pkg ([bf14941](https://github.com/textlint/textlint/commit/bf14941))
* **textlint:** Update README ([88cdb2e](https://github.com/textlint/textlint/commit/88cdb2e))


### BREAKING CHANGES

* **textlint:** It need to upgrade to 10.0.0




<a name="9.1.1"></a>
## [9.1.1](https://github.com/textlint/textlint/compare/textlint@9.1.0...textlint@9.1.1) (2017-11-05)


### Bug Fixes

* **textlint:** support scoped preset module  ([#329](https://github.com/textlint/textlint/issues/329)) ([a2c8f6b](https://github.com/textlint/textlint/commit/a2c8f6b))




<a name="9.1.0"></a>
# [9.1.0](https://github.com/textlint/textlint/compare/textlint@9.0.1...textlint@9.1.0) (2017-11-03)


### Features

* **textlint:** support shortcut scoped package name ([#326](https://github.com/textlint/textlint/issues/326)) ([0dff2cc](https://github.com/textlint/textlint/commit/0dff2cc))




<a name="9.0.0"></a>
# [9.0.0](https://github.com/textlint/textlint/compare/textlint@9.0.0-beta.0...textlint@9.0.0) (2017-10-28)




**Note:** Version bump only for package textlint

<a name="8.2.1"></a>
## [8.2.1](https://github.com/textlint/textlint/compare/textlint@8.2.0...textlint@8.2.1) (2017-05-21)


### Bug Fixes

* **textlint:** fix `config.configFile` is undefined at sometimes (#297) ([cd64560](https://github.com/textlint/textlint/commit/cd64560)), closes [#297](https://github.com/textlint/textlint/issues/297)




<a name="8.2.0"></a>
# [8.2.0](https://github.com/textlint/textlint/compare/textlint@8.1.0...textlint@8.2.0) (2017-05-21)


### Features

* **textlint-kernel:** add `configBaseDir` option (#295) ([85dad8a](https://github.com/textlint/textlint/commit/85dad8a))




<a name="8.1.0"></a>
# [8.1.0](https://github.com/textlint/textlint/compare/textlint@8.0.1...textlint@8.1.0) (2017-05-18)


### Features

* **textlint-kernel:** Add [@textlint](https://github.com/textlint)/kernel (#292) ([30473c3](https://github.com/textlint/textlint/commit/30473c3))




<a name="8.0.1"></a>
## [8.0.1](https://github.com/textlint/textlint/compare/textlint@8.0.0...textlint@8.0.1) (2017-05-11)


### Bug Fixes

* **textlint:** remove shelljs dependencies (#287) ([0e88942](https://github.com/textlint/textlint/commit/0e88942))




<a name="8.0.0"></a>
# 8.0.0 (2017-05-07)


### Bug Fixes

* **babel:** ignore lib directory ([12e581d](https://github.com/textlint/textlint/commit/12e581d))
* **fixer:** fix thrown error when empty result. (#274) ([7013cee](https://github.com/textlint/textlint/commit/7013cee)), closes [#274](https://github.com/textlint/textlint/issues/274)
* **textilnt:** fix JSDoc ([8a417e0](https://github.com/textlint/textlint/commit/8a417e0))


### Features

* **packages:** import textlint-plugin-text ([1b7a571](https://github.com/textlint/textlint/commit/1b7a571))
* **textlint:** update built-in textlint-plugin-markdown@^2 (#282) ([448fef9](https://github.com/textlint/textlint/commit/448fef9))


### BREAKING CHANGES

* **textlint:** markdown-to-ast@4 includes some breaking change
It enhance some linting result. It found potential issue.



<a name="7.4.0"></a>
# 7.4.0 (2017-04-11)


### Features

* **cli:** Support quiet mode (#268) ([7b1af88](https://github.com/textlint/textlint/commit/7b1af88))



<a name="7.3.0"></a>
# 7.3.0 (2017-03-04)


### Features

* **cli:** Support glob pattern (#264) ([d1cd6f3](https://github.com/textlint/textlint/commit/d1cd6f3))



<a name="7.2.2"></a>
## 7.2.2 (2017-02-12)


### Bug Fixes

* **config:** use rc-config-loader insteadof rc-loader (#262) ([df2154d](https://github.com/textlint/textlint/commit/df2154d)), closes [#39](https://github.com/textlint/textlint/issues/39)




<a name="7.4.0"></a>
# 7.4.0 (2017-04-11)


### Features

* **cli:** Support quiet mode (#268) ([7b1af88](https://github.com/textlint/textlint/commit/7b1af88))



<a name="7.3.0"></a>
# 7.3.0 (2017-03-04)


### Features

* **cli:** Support glob pattern (#264) ([d1cd6f3](https://github.com/textlint/textlint/commit/d1cd6f3))



<a name="7.2.2"></a>
## 7.2.2 (2017-02-12)


### Bug Fixes

* **config:** use rc-config-loader insteadof rc-loader (#262) ([df2154d](https://github.com/textlint/textlint/commit/df2154d)), closes [#39](https://github.com/textlint/textlint/issues/39)
