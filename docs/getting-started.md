---
id: getting-started
title: Getting Started with textlint
---

**textlint** does the following steps:

1. textlint loads rules, every single rule is a plugin and you can add more at runtime.
2. textlint parses *texts* using Markdown/Text/HTML parser plugin.
3. textlint uses an AST([Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree "Abstract syntax tree")) to evaluate patterns in *texts*.
4. textlint reports errors/warning if exist.

## Installation and Usage

NOTICE: If you run the following procedures on Windows, please use PowerShell.

### Create new workspace

Create `<your-workspace>` directory and `package.json` file. A [package.json](https://docs.npmjs.com/files/package.json "package.json") manages dependencies of packages that include `textlint`:

```
# Create your workspace directory and move to it.
mkdir your-workspace
cd your-workspace

# `npm init` command creates `package.json` file.
npm init --yes
```

### Installation of textlint
   
You can install `textlint` using npm. We recommend that you install `textlint` locally by running npm command with `--save-dev` option. This means that npm installs `textlint` in the `<your-workspace>/node_modules` folder.

```
# Installed textlint locally
npm install --save-dev textlint
```

### Installation of rules

You can find a rule in [A Collection of textlint rule](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule "A Collection of textlint rule").

As an example, let's install [textlint-rule-no-todo](https://github.com/textlint-rule/textlint-rule-no-todo "textlint-rule-no-todo"). If you have installed `textlint` locally, you must install each rule locally as well.

```
npm install --save-dev textlint-rule-no-todo
```

### Usage

You can run `textlint` on any Markdown files:

``` markdown
# file.md

- [ ] Write usage instructions

`- [ ]` is a code and not error.

```

```
npx textlint --rule no-todo file.md
```

![screenshot lint error](assets/screenshot-lint-error.png)

## Configuration

We recommend using `textlint` with `.textlintrc.json` configuration file.

Create a `.textlintrc.json` file in your workspace:

```
npx textlint --init
```

In this file, you'll see some rules configured like this:

```json
{
  "plugins": {},
  "filters": {},
  "rules": {
    "no-todo": true
  }
}
```

If there is a `.textlintrc`(`.textlintrc.{json,js,cjs,yaml,yml}`) file in your workspace, `textlint` loads `.textlintrc` automatically. So you can run textlint without any command line options:

```
npx textlint file.md
```

## Next Steps
   
- Learn about advanced [configuring](./configuring.md) of textlint.
- Explore [textlint's rules](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule)
- Can't find just the right rule? Make your own [custom rule](./rule.md).
- Can't handle `.ext` file? Make your own [custom plugin](./plugin.md).
- Make textlint even better by [contributing](./CONTRIBUTING.md).
