# Migration Guide to textlint v15

textlint v15 introduces **breaking changes** by removing all deprecated legacy APIs. This guide will help you migrate from the old APIs to the new ones.

## Overview of Changes

The following deprecated APIs have been completely removed:

- `TextLintEngine` → Use `createLinter()` instead
- `TextFixEngine` → Use `createLinter()` instead  
- `TextLintCore` → Use `createLinter()` or `@textlint/kernel` instead
- `textlint` (singleton instance) → Use `createLinter()` instead

## Benefits of the New API

- **Modern ESM Support**: Full support for both CommonJS and ES modules
- **Better TypeScript Support**: Improved type definitions and inference
- **Cleaner Architecture**: Clear separation between configuration loading and linting
- **More Flexible**: Easier to customize and extend for different use cases
- **Better Testing**: Each component can be tested independently

## Migration Examples

### 1. From `TextLintEngine` to `createLinter`

The most common migration scenario.

**Before (deprecated):**
```javascript
const { TextLintEngine } = require("textlint");

const engine = new TextLintEngine({
    configFile: ".textlintrc.json"
});
const results = await engine.executeOnFiles(["*.md"]);
const output = engine.formatResults(results);
console.log(output);
```

**After (new API):**
```javascript
import { createLinter, loadTextlintrc, loadLinterFormatter } from "textlint";

const descriptor = await loadTextlintrc({
    configFilePath: ".textlintrc.json"
});
const linter = createLinter({ descriptor });
const results = await linter.lintFiles(["*.md"]);
const formatter = await loadLinterFormatter({ formatterName: "stylish" });
const output = formatter.format(results);
console.log(output);
```

### 2. From `TextFixEngine` to `createLinter`

For fixing text content.

**Before (deprecated):**
```javascript
const { TextFixEngine } = require("textlint");

const engine = new TextFixEngine();
const results = await engine.executeOnFiles(["*.md"]);
// Results contain fixed content
```

**After (new API):**
```javascript
import { createLinter, loadTextlintrc } from "textlint";

const descriptor = await loadTextlintrc();
const linter = createLinter({ descriptor });
const results = await linter.fixFiles(["*.md"]);
// Results contain fixed content
```

### 3. From `TextLintCore` to `createLinter`

For programmatic usage with custom rules.

**Before (deprecated):**
```javascript
const { TextLintCore } = require("textlint");

const textlint = new TextLintCore();
textlint.setupRules({
    "rule-name": require("./my-rule")
});
textlint.setupPlugins({
    "@textlint/markdown": require("@textlint/textlint-plugin-markdown")
});
const result = await textlint.lintText("Hello world", "test.md");
```

**After (new API):**
```javascript
import { createLinter } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import { moduleInterop } from "@textlint/module-interop";

const descriptor = new TextlintKernelDescriptor({
    rules: [
        {
            ruleId: "rule-name",
            rule: moduleInterop((await import("./my-rule")).default)
        }
    ],
    plugins: [
        {
            pluginId: "@textlint/markdown",
            plugin: moduleInterop((await import("@textlint/textlint-plugin-markdown")).default)
        }
    ]
});
const linter = createLinter({ descriptor });
const result = await linter.lintText("Hello world", "test.md");
```

### 4. From singleton `textlint` to `createLinter`

**Before (deprecated):**
```javascript
const { textlint } = require("textlint");

textlint.setupRules({ "rule-name": ruleModule });
const result = await textlint.lintText("text", "file.md");
```

**After (new API):**
```javascript
import { createLinter } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";

const descriptor = new TextlintKernelDescriptor({
    rules: [{ ruleId: "rule-name", rule: ruleModule }]
});
const linter = createLinter({ descriptor });
const result = await linter.lintText("text", "file.md");
```

## Deprecated APIs Reference

This section provides detailed documentation about the deprecated APIs that have been removed in v15. This information is preserved here for migration purposes.

### TextLintEngine (Deprecated)

The `TextLintEngine` was the primary interface for linting files in textlint v14 and earlier.

#### Constructor Options

```javascript
const engine = new TextLintEngine(options);
```

**Options:**
- `configFile`: Path to configuration file (`.textlintrc`, `.textlintrc.js`, etc.)
- `rulePaths`: Array of directories to load rules from
- `formatterName`: Name of formatter to use for output
- `plugins`: Array of plugin names to load
- `rules`: Object mapping rule names to rule modules
- `presets`: Array of preset names to load
- `extensions`: Array of file extensions to process
- `cache`: Enable/disable caching
- `cacheLocation`: Path to cache file

#### Methods

**`executeOnFiles(patterns)`**
```javascript
const results = await engine.executeOnFiles(["*.md", "*.txt"]);
```
- `patterns`: Array of glob patterns or file paths
- Returns: Array of lint results

**`executeOnText(text, filePath)`**
```javascript
const results = await engine.executeOnText("# Hello", "README.md");
```
- `text`: Text content to lint
- `filePath`: File path for context
- Returns: Array of lint results

**`formatResults(results, formatterName?)`**
```javascript
const output = engine.formatResults(results, "stylish");
```
- `results`: Array of lint results
- `formatterName`: Optional formatter name (defaults to constructor option)
- Returns: Formatted string output

### TextFixEngine (Deprecated)

The `TextFixEngine` was used for auto-fixing lint errors.

#### Constructor Options

Same as `TextLintEngine`.

#### Methods

**`executeOnFiles(patterns)`**
```javascript
const results = await fixEngine.executeOnFiles(["*.md"]);
```
- Automatically fixes issues and returns fix results
- Returns: Array of fix results with `output` property

**`executeOnText(text, filePath)`**
```javascript
const results = await fixEngine.executeOnText("# Hello", "README.md");
```
- Returns: Array of fix results

### TextLintCore (Deprecated)

The `TextLintCore` was the low-level API for custom integrations.

#### Constructor

```javascript
const textlint = new TextLintCore(config?);
```

#### Methods

**`setupRules(rules, rulesBaseConfig?)`**
```javascript
textlint.setupRules({
    "rule-name": require("textlint-rule-example")
}, {
    "rule-name": { severity: "error" }
});
```

**`setupFilterRules(rules, rulesConfig?)`**
```javascript
textlint.setupFilterRules({
    "filter-rule": require("textlint-filter-rule-example")
});
```

**`setupPlugins(plugins, pluginsConfig?)`**
```javascript
textlint.setupPlugins({
    "plugin-name": require("textlint-plugin-example")
});
```

**`setupPresets(presets, presetsConfig?)`**
```javascript
textlint.setupPresets({
    "preset-name": require("textlint-rule-preset-example")
});
```

**`lintText(text, filePath)`**
```javascript
const result = await textlint.lintText("# Hello", "README.md");
```

**`lintFile(filePath)`**
```javascript
const result = await textlint.lintFile("README.md");
```

**`fixText(text, filePath)`**
```javascript
const result = await textlint.fixText("# Hello", "README.md");
```

**`fixFile(filePath)`**
```javascript
const result = await textlint.fixFile("README.md");
```

### Singleton textlint (Deprecated)

A pre-configured instance of `TextLintCore`.

```javascript
const { textlint } = require("textlint");

textlint.setupRules({ "rule-name": ruleModule });
const result = await textlint.lintText("text", "file.md");
```

## Detailed Examples from Previous Documentation

### TextLintEngine Example (Removed in v15)

This example shows how `TextLintEngine` was used before v15:

```js
// DEPRECATED - This no longer works in v15
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
```

**Equivalent v15+ code:**

```js
import { createLinter, loadTextlintrc, loadLinterFormatter } from "textlint";
import path from "node:path";

async function lintFile(filePath) {
    const descriptor = await loadTextlintrc({
        rules: ["no-todo"]
    });
    const linter = createLinter({ descriptor });
    const filePathList = [path.resolve(process.cwd(), filePath)];
    const results = await linter.lintFiles(filePathList);
    
    const hasErrors = results.some(result => result.messages.length > 0);
    if (hasErrors) {
        const formatter = await loadLinterFormatter({ formatterName: "pretty-error" });
        const output = formatter.format(results);
        console.log(output);
    } else {
        console.log("All Passed!");
    }
}
```

### executeOnText Migration Example

**Old API:**
```js
const TextLintEngine = require("textlint").TextLintEngine;
const engine = new TextLintEngine();
const ruleText = "Tihs is my text.";
const results = await engine.executeOnText(ruleText);
```

**New API:**
```js
import { createLinter, loadTextlintrc } from "textlint";

const descriptor = await loadTextlintrc();
const linter = createLinter({ descriptor });
const ruleText = "Tihs is my text.";
// Note: dummy filename needed to determine content type
const results = await linter.lintText(ruleText, 'document.txt');
```

## Advanced Migration Scenarios

### Mixing Configuration File and Custom Rules

**Before (deprecated):**
```javascript
const { TextLintCore } = require("textlint");
const { Config } = require("textlint/lib/config/config");

const config = new Config({ configFile: ".textlintrc.json" });
const textlint = new TextLintCore(config);
textlint.setupRules({ "custom-rule": customRule });
```

**After (new API):**
```javascript
import { createLinter, loadTextlintrc } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";

const textlintrcDescriptor = await loadTextlintrc({
    configFilePath: ".textlintrc.json"
});
const customDescriptor = new TextlintKernelDescriptor({
    rules: [{ ruleId: "custom-rule", rule: customRule }]
});
const linter = createLinter({
    descriptor: customDescriptor.concat(textlintrcDescriptor)
});
```

### Error Handling

**Before (deprecated):**
```javascript
const { TextLintEngine } = require("textlint");

const engine = new TextLintEngine();
try {
    const results = await engine.executeOnFiles(["*.md"]);
    if (engine.isErrorResults(results)) {
        // Handle errors
    }
} catch (error) {
    // Handle exceptions
}
```

**After (new API):**
```javascript
import { createLinter, loadTextlintrc } from "textlint";

try {
    const descriptor = await loadTextlintrc();
    const linter = createLinter({ descriptor });
    const results = await linter.lintFiles(["*.md"]);
    
    const hasErrors = results.some(result => 
        result.messages.some(message => message.severity === 2)
    );
    if (hasErrors) {
        // Handle errors
    }
} catch (error) {
    // Handle exceptions
}
```

## Method Mapping Reference

| Deprecated API | New API | Notes |
|----------------|---------|-------|
| `new TextLintEngine()` | `createLinter()` | Requires descriptor from `loadTextlintrc()` |
| `new TextFixEngine()` | `createLinter()` | Use `fixFiles()` or `fixText()` methods |
| `new TextLintCore()` | `createLinter()` or `@textlint/kernel` | For low-level usage |
| `engine.executeOnFiles()` | `linter.lintFiles()` | Similar functionality |
| `engine.executeOnText()` | `linter.lintText()` | Requires file extension hint |
| `engine.formatResults()` | `loadLinterFormatter()` then `format()` | Separate formatter loading |
| `textlint.setupRules()` | `TextlintKernelDescriptor` | Use descriptor pattern |
| `textlint.setupPlugins()` | `TextlintKernelDescriptor` | Use descriptor pattern |

## Common Pitfalls and Solutions

### 1. File Extension Detection

**Issue**: `lintText()` requires a file extension hint.

**Solution**: Always provide a meaningful file extension:
```javascript
// Bad
await linter.lintText("# Title", "unknown");

// Good  
await linter.lintText("# Title", "document.md");
```

### 2. Module Loading

**Issue**: Direct `require()` calls may not work with ES modules.

**Solution**: Use `moduleInterop()` helper:
```javascript
import { moduleInterop } from "@textlint/module-interop";

const rule = moduleInterop((await import("./my-rule")).default);
```

### 3. Formatter Usage

**Issue**: Formatters are no longer methods on engine instances.

**Solution**: Load formatters separately:
```javascript
import { loadLinterFormatter } from "textlint";

const formatter = await loadLinterFormatter({ formatterName: "stylish" });
const output = formatter.format(results);
```

### 4. Configuration Loading

**Issue**: Configuration is no longer automatically loaded.

**Solution**: Explicitly load configuration:
```javascript
import { loadTextlintrc } from "textlint";

const descriptor = await loadTextlintrc(); // Auto-detects config
// OR
const descriptor = await loadTextlintrc({ 
    configFilePath: ".textlintrc.json" 
});
```

## Testing Your Migration

After migrating, ensure your code works by:

1. **Running existing tests** - They should pass with the new API
2. **Checking TypeScript compilation** - New APIs have better type support
3. **Testing with both CommonJS and ESM** - New APIs support both
4. **Verifying output format** - Results should be identical

## Documentation Updates

As part of the v15 release, all documentation has been updated to remove references to the deprecated APIs:

- [`docs/use-as-modules.md`](./use-as-modules.md) - Updated to focus on the new APIs only
- [`examples/use-as-module/`](../examples/use-as-module/) - Examples using the new APIs
- [`examples/use-as-ts-module/`](../examples/use-as-ts-module/) - TypeScript examples

All deprecated API documentation has been consolidated into this migration guide to preserve the information for users who need to migrate their code.

## Support and Resources

If you encounter issues during migration:

1. **Check the examples**: The [`examples/`](../examples/) directory contains working examples using the new APIs
2. **Read the API documentation**: [`docs/use-as-modules.md`](./use-as-modules.md) provides comprehensive API documentation
3. **Open an issue**: If you find migration issues, please [open an issue on GitHub](https://github.com/textlint/textlint/issues)

## Summary

textlint v15 represents a significant modernization of the API while maintaining full linting functionality. The new APIs provide:

- Better TypeScript support
- Modern ES module compatibility  
- Cleaner separation of concerns
- Reduced bundle size
- Future-proof architecture

While the migration requires code changes, the new APIs offer a much better developer experience and set the foundation for future textlint development.
