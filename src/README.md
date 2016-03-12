# Architecture

## CLI

- [options.js](./options.js)
    - Parse cli options
- [cli.js](./cli.js)
    - create config
    - run engine
    - output result
    
## Engine

Process files are wanted to lint/fix.

- textlint-engine.js
- rule-manager.js
- textlint-module-resolver.js

These are shared between config and engine.
Don't shared between engine and core.

## Core

Process file/text wanted to lint/fix

- textlint-core.js
- source-code.js
- rule-creator-set.js
- task/
- linter/
- fixer/

## Shared

These are shared between config and engine and core.

- rule-severity
- union-syntax
