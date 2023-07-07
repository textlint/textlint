---
id: use-as-modules
title: Use as Node Modules
---

## Overview

`textlint` package provides some High-Level APIs.

- If you want to load `.textlintrc`, please use `textlint` package
- If you do not want to load `.textlintrc`, please use `@textlint/kernel` package

### CLI(Command Line Interface)

CLI parse command arguments, and run Engine with the options.
It returns exit code.

```js
import { cli } from "textlint";
const result = await cli.execute(`./README.md --rule textlint-rule-no-todo`);
assert.strictEqual(result, 0);
```

## APIs

textlint v12.3.0 introduce new APIs.
textlint will drop support old APIs(`textlint`, `TextLintEngine`, `TextFixEngine`, and `TextLintCore`) in the future.

📝 old APIs can not support ECMAScript modules, new APIs support ECMAScript modules.

- `createLinter`: create linter instance
    - `lintFiles(files): Promise<TextlintResult[]>`: lint files and return linter messages
    - `lintText(text, filePath): Promise<TextlintResult>` lint text with virtual filePath and return linter messages
    - `fixFiles(files): Promise<TextlintFixResult[]>` lint text and return fixer messages
    - `fixText(text, filePath): Promise<TextlintFixResult>` lint text with virtual filePath and return fixer messages
        - `fixFiles` and `fixText` does not modify files
- `loadTextlintrc`: load `.textlintrc` config file and return a descriptor object
- `loadLinerFormatter` and `loadFixerFormatter`: load formatter

Lint files and output to console.

```ts
import { createLinter, loadTextlintrc, loadLinterFormatter } from "textlint";
// descriptor is a structure object for linter
// It includes rules, plugins, and options
const descriptor = await loadTextlintrc();
const linter = createLinter({
    descriptor
});
const results = await linter.lintFiles(["*.md"]);
// textlint has two types formatter sets for linter and fixer
const formatter = await loadLinterFormatter({ formatterName: "stylish" });
const output = formatter.format(results);
console.log(output);
```

Fix text and get the fixed text.

```ts
import { createLinter, loadTextlintrc } from "textlint";
// descriptor is a structure object for linter
// It includes rules, plugins, and options
const descriptor = await loadTextlintrc();
const linter = createLinter({
    descriptor
});
const result = await linter.fixText("TODO: fix me", "DUMMY.md");
console.log(result.output); // fixed result
```

Add custom rules and plugins.

```ts
import { createLinter, loadTextlintrc } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import { moduleInterop } from "@textlint/module-interop";
// Create a descriptor for custom rules and plugins
const customDescriptor = new TextlintKernelDescriptor({
    rules: [
        {
            ruleId: "custom-rule",
            rule: moduleInterop((await import("./custom-plugin")).default)
        }
    ],
    plugins: [
        {
            pluginId: "custom-plugin",
            plugin: moduleInterop((await import("./custom-plugin")).default)
        }
    ]
});
const textlintrcDescriptor = await loadTextlintrc();
const linter = createLinter({
    // merge customDescriptor and textlintrcDescriptor
    // if same ruleId or pluginId, customDescriptor is used.
    descriptor: customDescriptor.concat(textlintrcDescriptor)
});
const result = await linter.lintText("TODO: fix me");
console.log(result);
```

Get lintable file extensions.
`textlintrcDescriptor.availableExtensions` provide list of supported file extensions.

```ts
import { createLinter, loadTextlintrc } from "textlint";
const textlintrcDescriptor = await loadTextlintrc();
const availableExtensions = textlintrcDescriptor.availableExtensions;
console.log(availableExtensions); // => [".md", ".txt"]
```

## Deprecated APIs


### [Deprecated] Engine

textlint has two engines `TextLintEngine` and `TextFixEngine`.

Both engine

- Load configuration from `.textlintrc`.
- Handle **multiple** files or text string.
- Return an array of `TextLintResult` or `TextLintFixResult`
  - actually, return a Promise like `Promise<TextLintResult[]>`

### [Deprecated] Core

textlint's core

- Accept configuration as object.
- Handle a **single** file or text string.
- Return `TextLintResult` or `TextLintFixResult`
  - actually, return a Promise like `Promise<TextLintResult>`

### Example

Lint files using `TextLintEngine`:

See [examples/use-as-module/index.js](https://github.com/textlint/textlint/blob/master/examples/use-as-module/index.js)

```js
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

You can use [textlint-tester](https://www.npmjs.com/package/textlint-tester) for testing your custom rule.

- [rule.md](./rule.md)
- [textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester")

Consult link:

- [spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule](https://github.com/azu/textlint-rule-spellcheck-tech-word/blob/master/test/test.js "spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule")
