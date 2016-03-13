# Architecture

## Overview

![overview](https://monosnap.com/file/7XRjyiTviKHE4t4CAeYzh6UuBc3zGp.png)

```
title: Architecture
CLI->Engine: file*s*
Engine->Core: file
Core->Task: AST
Task->Task: Lint
Task-->Core: Message
Core-->Engine: Results
Engine-->CLI: output
```

- CLI know Engine
- Engine know Core

## CLI

- [options.js](./options.js)
    - Parse cli options
- [cli.js](./cli.js)
    - create config
    - run engine
    - output result
    
## Engine

Process file**s** are wanted to lint/fix and prepare configuration of rules and plugins.

- engine/ directory
- textlint-engine.js
- rule-manager.js
- textlint-module-resolver.js

These are shared between config and engine.
Don't shared between engine and core.

## Core

Process file/text wanted to lint/fix

- `core/` directory
- textlint-core.js
- source-code.js
- rule-creator-set.js
- task/
- linter/
- fixer/

To be clear about difference of linter and fixer.

- *Linter* process in parallel.
- *Fixer* process in series.

## Shared

These are shared between config and engine and core.

- rule-severity
- union-syntax
