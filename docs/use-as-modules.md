---
id: use-as-modules
title: Use as Node Modules
---

## Overview

![overview](assets/architecture.png)


`textlint` module expose these header at [index.js](https://github.com/textlint/textlint/blob/master/packages/textlint/src/index.ts)

```js
// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md

// Command line interface
export { cli } from "./cli";

// It is a singleton object of TextLintCore
// Recommend: use TextLintCore
export { textlint } from "./textlint";

// TextLintEngine is a wrapper around `textlint` for linting **multiple** files
// include formatter, detecting utils
// <Recommend>: It is easy to use
// You can see engine/textlint-engine-core.js for more detail
export { TextLintEngine } from "./textlint-engine";

// TextFixEngine is a wrapper around `textlint` for linting **multiple** files
// include formatter, detecting utils
// <Recommend>: It is easy to use
// You can see engine/textlint-engine-core.js for more detail
export { TextFixEngine } from "./textfix-engine";

// Core API for linting a **single** text or file.
export { TextLintCore } from "./textlint-core";
```

Recommend to use `TextLintEngine`.

## Architecture

See <https://github.com/textlint/textlint/blob/master/packages/textlint/src/README.md>

### CLI(Command Line Interface)

CLI parse command arguments, and run Engine with the options.

### Engine

textlint has two engines `TextLintEngine` and `TextFixEngine`.

Both engine

- Load configuration from `.textlintrc`.
- Handle **multiple** files or text string.
- Return an array of `TextLintResult` or `TextLintFixResult`
    - actually, return a Promise like `Promise<TextLintResult[]>`

### Core

textlint's core 

- Accept configuration as object.
- Handle a **single** file or text string.
- Return `TextLintResult` or `TextLintFixResult`
    - actually, return a Promise like `Promise<TextLintResult>`

## Example

Lint files using `TextLintEngine`:

See [examples/use-as-module/index.js](https://github.com/textlint/textlint/tree/master/examples/use-as-module/index.js)

```js
// LICENSE : MIT
"use strict";
const TextLintEngine = require("textlint").TextLintEngine;
const path = require("path");
function lintFile(filePath) {
    const options = {
        // load rules from [../rules]
        rules: ["no-todo"],
        formatterName: "pretty-error"
    };
    const engine = new TextLintEngine(options);
    const filePathList = [path.resolve(process.cwd(), filePath)];
    return engine.executeOnFiles(filePathList).then(function(results) {
        if (engine.isErrorResults(results)) {
            const output = engine.formatResults(results);
            console.log(output);
        } else {
            console.log("All Passed!");
        }
    });
}

lintFile(`${__dirname}/README.md`).catch(function(error) {
    console.error(error);
    process.exit(1);
});
```

## Testing

You can use [textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester") for testing your custom rule.

- [rule.md](./rule.md)
- [textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester")

Consult link: 

- [spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule](https://github.com/azu/textlint-rule-spellcheck-tech-word/blob/master/test/test.js "spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule")
