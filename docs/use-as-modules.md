---
id: use-as-modules
title: Use as Node Modules
---

## Overview

`textlint` package provides High-Level APIs for integrating textlint into your applications.

- If you want to load `.textlintrc` configuration, use the `textlint` package
- If you need lower-level control without `.textlintrc`, use the `@textlint/kernel` package directly

> **Note:** textlint v15.0.0 removed all deprecated legacy APIs (`textlint`, `TextLintEngine`, `TextFixEngine`, and `TextLintCore`). If you're migrating from these APIs, see the [migration guide](./migration-to-v15.md).

### CLI (Command Line Interface)

The CLI interface provides programmatic access to textlint's command-line functionality:

```js
import { cli } from "textlint";
const result = await cli.execute(`./README.md --rule textlint-rule-no-todo`);
assert.strictEqual(result, 0); // 0 = success, 1 = lint errors, 2 = fatal errors
```

## Modern APIs (v15+)

The modern textlint API provides these core functions:

### Core Functions

- **`createLinter(options)`**: Creates a linter instance
  - `lintFiles(files): Promise<TextlintResult[]>`: Lint multiple files
  - `lintText(text, filePath): Promise<TextlintResult>`: Lint text content with a virtual file path
  - `fixFiles(files): Promise<TextlintFixResult[]>`: Auto-fix multiple files  
  - `fixText(text, filePath): Promise<TextlintFixResult>`: Auto-fix text content
  - `scanFilePath(filePath): Promise<ScanFilePathResult>`: Check if a file path is lintable

- **`loadTextlintrc(options?)`**: Load `.textlintrc` configuration file
- **`loadLinterFormatter(options)`**: Load output formatter for lint results
- **`loadFixerFormatter(options)`**: Load output formatter for fix results

### Key Concepts

- **Virtual File Paths**: The `filePath` parameter in `lintText()` and `fixText()` doesn't need to be a real file. It should hint at the content type (e.g., `document.md` for Markdown content).
- **Immutable Operations**: `fixFiles()` and `fixText()` return fix results but don't modify files directly.

## Examples

### Lint files and output to console

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

### Fix text and get the fixed text

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

## Add custom rules and plugins

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

// The second param should be a filename whose extension hints at the type
// of content being passed to lintText(), e.g. README.md for Markdown.
const result = await linter.lintText("TODO: fix me", "README.md");
console.log(result);

```

## Get lintable file extensions

`textlintrcDescriptor.availableExtensions` provide list of supported file extensions.

```ts
import { createLinter, loadTextlintrc } from "textlint";
const textlintrcDescriptor = await loadTextlintrc();
const availableExtensions = textlintrcDescriptor.availableExtensions;
console.log(availableExtensions); // => [".md", ".txt"]
```

## Want to know the file path is lintable or not

```ts
import { createLinter, loadTextlintrc } from "textlint";
const textlintrcDescriptor = await loadTextlintrc();
const linter = createLinter({
    descriptor: textlintrcDescriptor
});
const result = await linter.scanFilePath("README.md");
// result.status is "ok" or "ignored" or "error"
if (result.status === "ok") {
    const lintResult = await linter.lintText("README content", "README.md");
    console.log(lintResult);
## Testing

You can use [textlint-tester](https://www.npmjs.com/package/textlint-tester) for testing your custom rule.

- [rule.md](./rule.md)
- [textlint-tester](https://www.npmjs.com/package/textlint-tester "textlint-tester")

Consult link:

- [spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule](https://github.com/azu/textlint-rule-spellcheck-tech-word/blob/master/test/test.js "spellcheck-tech-word-textlint-rule/test.js at master · azu/spellcheck-tech-word-textlint-rule")
