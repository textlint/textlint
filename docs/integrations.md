---
id: integrations
title: Integrating with Editors, Tools, etc..
---

## Editors

- Atom Editor
  - [1000ch/linter-textlint](https://github.com/1000ch/linter-textlint "1000ch/linter-textlint")
- SublimeText
  - [joeybaker/sublimelinter-textlint](https://github.com/joeybaker/sublimelinter-textlint)
- Vim
  - [ale](https://github.com/dense-analysis/ale)
  - [vim-textlint](https://github.com/heavenshell/vim-textlint "vim-textlint")
  - [scrooloose/syntastic](https://github.com/vim-syntastic/syntastic "scrooloose/syntastic")
    - See [Markdown](https://github.com/vim-syntastic/syntastic/wiki/Markdown "Markdown"), [Text](https://github.com/vim-syntastic/syntastic/wiki/Text "Text") and [HTML](https://github.com/vim-syntastic/syntastic/wiki/HTML "HTML") of [scrooloose/syntastic Wiki](https://github.com/vim-syntastic/syntastic/wiki/Syntax-Checkers "Syntax Checkers · scrooloose/syntastic Wiki")
- Visual Studio Code
  - [taichi/vscode-textlint](https://github.com/taichi/vscode-textlint)
- [micro](https://github.com/zyedidia/micro "micro")
  - [hidaruma/micro-textlint-plugin](https://github.com/hidaruma/micro-textlint-plugin "hidaruma/micro-textlint-plugin: textlint plugin for micro-editor")
- NetBeans
  - [netbeans-textlint-plugin](https://github.com/junichi11/netbeans-textlint-plugin "netbeans-textlint-plugin")
- Emacs
  - [flycheck/flycheck](https://www.flycheck.org/en/latest/languages.html#syntax-checker-textlint "emacs-flycheck-package")


## AI Assistants (MCP)

textlint can be used as a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server, enabling AI assistants to interact with textlint directly:

```bash
npx textlint --mcp
```

The MCP server provides tools for linting and fixing text content, allowing AI assistants to automatically check and improve text quality using your textlint configuration.

For detailed setup instructions, see [MCP Setup Guide](./mcp.md).

## App

- [textlint-app](https://github.com/textlint/textlint-app "textlint-app")
  - Standalone cross platform app. No need Node.js environment.

## Build Systems

- gulp plugin
  - [gulp-textlint](https://github.com/textlint/gulp-textlint "gulp-textlint")
- Grunt plugin
  - [grunt-textlint](https://github.com/textlint/grunt-textlint "grunt-textlint")

## CI/CD

### GitHub Actions

You can integrate textlint into your GitHub Actions workflow to automatically check text content in pull requests and commits.

#### Prerequisites

Before setting up GitHub Actions, ensure your project has:

1. A textlint configuration file (`.textlintrc.json`, `.textlintrc.js`, etc.)
2. Required textlint rules and plugins installed as dependencies in `package.json`
3. A npm script for running textlint (e.g., `"textlint": "textlint docs/**"` in `package.json`)

textlint has no default rules, so proper configuration is essential. See [Configuring textlint](./configuring.md) for setup instructions.

#### Basic Setup

Create `.github/workflows/textlint.yml`:

```yaml
name: textlint
on:
  push:
  pull_request:

jobs:
  textlint:
    name: textlint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
      - run: npm ci
      - run: npm run textlint
```

#### Pull Request Check

For checking only changed files in pull requests:

```yaml
name: textlint
on:
  pull_request:

jobs:
  textlint:
    name: textlint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
      - run: npm ci
      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v45
        with:
          files: '**/*.{md,txt}'
      - name: Run textlint on changed files
        if: steps.changed-files.outputs.any_changed == 'true'
        run: npx textlint ${{ steps.changed-files.outputs.all_changed_files }}
```

#### Third-party Actions

- [reviewdog](https://github.com/reviewdog/reviewdog): Automated code review tool that supports textlint
- [action-textlint](https://github.com/tsuyoshicho/action-textlint): Dedicated GitHub Action for running textlint with reviewdog integration

## Browser

- Chrome Extension
  - [Chrome: textlint-proofreader](https://chrome.google.com/webstore/detail/textlint-proofreader/hdongmdneapmhfblomidbafplpanpdmm)
  - [io-monad/textlint-chrome-extension: textlint Chrome Extension](https://github.com/io-monad/textlint-chrome-extension "io-monad/textlint-chrome-extension: textlint Chrome Extension")

## Program languages

- [textlintr](https://github.com/uribo/textlintr): R language package

## Other

- [Pronto](https://github.com/prontolabs/pronto "Pronto"): [pronto-textlint](https://github.com/seikichi/pronto-textlint "pronto-textlint")
- [reviewdog](https://github.com/reviewdog/reviewdog "reviewdog"): See [azu/textlint-reviewdog-example](https://github.com/azu/textlint-reviewdog-example "azu/textlint-reviewdog-example: textlint + reviewdog example project")
