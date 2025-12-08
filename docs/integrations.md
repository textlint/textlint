---
id: integrations
title: Integrating with Editors, CI, Tools, etc..
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
  - [textlint/vscode-textlint](https://github.com/textlint/vscode-textlint)
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
        env:
          ALL_CHANGED_FILES: ${{ steps.changed-files.outputs.all_changed_files }}
        run: |
          for file in ${ALL_CHANGED_FILES}; do
            npm exec -- textlint "$file"
          done
```

#### GitHub Annotations

You can use the `github` formatter to display lint results as GitHub Actions annotations. This makes errors visible directly in the pull request file view:

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
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
      - run: npm ci
      - run: npm run textlint -- --format github
```

Or for changed files only:

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
      - name: Run textlint with GitHub formatter
        if: steps.changed-files.outputs.any_changed == 'true'
        env:
          ALL_CHANGED_FILES: ${{ steps.changed-files.outputs.all_changed_files }}
        run: |
          for file in ${ALL_CHANGED_FILES}; do
            npm exec -- textlint --format github "$file"
          done
```

The `github` formatter displays lint messages as:
- Inline annotations in pull request file views
- Annotations in the job summary
- Detailed error messages in job logs

See [Formatter documentation](./formatter.md#github-formatter) for more details.

#### Third-party Actions

- [reviewdog](https://github.com/reviewdog/reviewdog): Automated code review tool that supports textlint
- [action-textlint](https://github.com/tsuyoshicho/action-textlint): Dedicated GitHub Action for running textlint with reviewdog integration

## Browser

- [@textlint/editor](https://github.com/textlint/editor): Privacy-first browser extension for offline text linting
- Chrome Extension
  - [Chrome: textlint-proofreader](https://chrome.google.com/webstore/detail/textlint-proofreader/hdongmdneapmhfblomidbafplpanpdmm)
  - [io-monad/textlint-chrome-extension: textlint Chrome Extension](https://github.com/io-monad/textlint-chrome-extension "io-monad/textlint-chrome-extension: textlint Chrome Extension")

## Program languages

- [textlintr](https://github.com/uribo/textlintr): R language package

## Other

- [Pronto](https://github.com/prontolabs/pronto "Pronto"): [pronto-textlint](https://github.com/seikichi/pronto-textlint "pronto-textlint")
