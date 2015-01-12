## 2.0.0 (2015-01-12)


#### Bug Fixes

* **cli:** fix typing ([d5285eb6](https://github.com/azu/textlint/commit/d5285eb6b5a00d3a83708c104a79830832c04980))
* **type:** fix `range` type ([95d63070](https://github.com/azu/textlint/commit/95d6307018b2abd64cae621a0ef0a063a12a7b83))


#### Features

* **cli-engine:** cli-engine accept config object. ([e9e914ae](https://github.com/azu/textlint/commit/e9e914aea304a60c7bc02c19aa70ab33f5f919a4))


### 1.4.3 (2015-01-06)


#### Bug Fixes

* **rule:** fix `no-todo` rule to correct ([445423de](https://github.com/azu/textlint/commit/445423deede6568d81e1d38648aa370ee2d41002))


### 1.4.2 (2015-01-05)


#### Bug Fixes

* **textlint:** fix message bug during  linting multiple files ([201f729d](https://github.com/azu/textlint/commit/201f729d27d12b7a874755d783604931d2c041d3))


## 1.4.0 (2015-01-05)


#### Features

* **markdown:** update `markdown-to-ast` ver2 ([f682d9f7](https://github.com/azu/textlint/commit/f682d9f7e90252488596633f427c3742f48bef64))
* **parser:** use new text parser ([09ef2d50](https://github.com/azu/textlint/commit/09ef2d50d934a18529212ccfcda4b5d07d0dd4b7))
* **textlint:** change traverse rule completely ([5aaaa880](https://github.com/azu/textlint/commit/5aaaa88050da0f1a3774c7e56d7f61eea938aa0d))


## 1.3.0 (2015-01-02)


#### Bug Fixes

* **rule-context:** use union-syntax instead of markdown-syntax ([385ed4d0](https://github.com/azu/textlint/commit/385ed4d0246b5d77542d3a4c6fdc896e000656bd))


#### Features

* **markdown:** Carve out parse/markdown to module ([6b310fae](https://github.com/azu/textlint/commit/6b310fae5b88e9c71596a560be38907f2ff2de6e))


### 1.0.1 (2014-12-29)


#### Bug Fixes

* **rules:** fix no-todo rule ([a06c01e4](https://github.com/azu/textlint/commit/a06c01e443ce301d2e75a1db5a29d422caf859cf))


## 1.0.0 (2014-12-29)


#### Bug Fixes

* ** markdown :**
  * use structured-source to compute column number ([5aab0ebd](https://github.com/azu/textlint/commit/5aab0ebdf037240d210764e39d0eee8f41250495))
  * fix range algorithm ([28e382f1](https://github.com/azu/textlint/commit/28e382f1636f7540c32891de13e8ff043f77868b))
* ** rule :** Change RuleError args ([881c267a](https://github.com/azu/textlint/commit/881c267a8e218572e79581ffa5cdb02643a7b095))
* ** typing :** fix type of array ([a82c7c84](https://github.com/azu/textlint/commit/a82c7c8494f7757dc8232236effa537be7ab309d))


#### Features

* ** parser :** implement `range` in TxtNode ([1f33064b](https://github.com/azu/textlint/commit/1f33064b8c344a4b7c9486965f07c26cfe41263e))
* **cli:**
  * add `-o` option ([e64f6ddb](https://github.com/azu/textlint/commit/e64f6ddbdeb12e640f755d892779d8b83a87f7eb))
  * add `-o` option ([37cc37e7](https://github.com/azu/textlint/commit/37cc37e763f33daeb8718d5965b41b394d7dc1db))
* **markdown:** normalize markdown with yaml like jekyll ([a0a4e5c3](https://github.com/azu/textlint/commit/a0a4e5c329381b91503d5fd690a280ea63082147))


