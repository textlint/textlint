---
title: textlint v15.0.0 (Draft)
authors: azu
draft: true
---

We are pleased to announce the release of textlint v15.0.0.
This release includes major breaking changes by removing all deprecated legacy APIs.

## Summary

textlint v15 is a major release that removes all deprecated APIs that have been marked as deprecated since v12.3.0.
This significantly reduces the codebase size and maintenance burden while providing a cleaner, more modern API surface.

**Breaking Changes:**
- Removed `TextLintEngine` - Use `createLinter()` instead
- Removed `TextFixEngine` - Use `createLinter()` instead  
- Removed `TextLintCore` - Use `createLinter()` or `@textlint/kernel` instead
- Removed `textlint` (singleton instance) - Use `createLinter()` instead

## Breaking Changes

### Removed Deprecated APIs

The following deprecated APIs have been completely removed from the `textlint` package:

#### `TextLintEngine` → `createLinter()`

**Before (v14 and earlier):**
```javascript
const { TextLintEngine } = require("textlint");

const engine = new TextLintEngine({
    configFile: ".textlintrc.json"
});
const results = await engine.executeOnFiles(["*.md"]);
const output = engine.formatResults(results);
console.log(output);
```

**After (v15+):**
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

#### `TextFixEngine` → `createLinter()`

**Before (v14 and earlier):**
```javascript
const { TextFixEngine } = require("textlint");

const engine = new TextFixEngine();
const results = await engine.executeOnFiles(["*.md"]);
```

**After (v15+):**
```javascript
import { createLinter, loadTextlintrc } from "textlint";

const descriptor = await loadTextlintrc();
const linter = createLinter({ descriptor });
const results = await linter.fixFiles(["*.md"]);
```

#### `TextLintCore` → `createLinter()` or `@textlint/kernel`

**Before (v14 and earlier):**
```javascript
const { TextLintCore } = require("textlint");

const textlint = new TextLintCore();
textlint.setupRules({
    "rule-name": require("./my-rule")
});
const result = await textlint.lintText("Hello world", "test.md");
```

**After (v15+):**
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
    ]
});
const linter = createLinter({ descriptor });
const result = await linter.lintText("Hello world", "test.md");
```

#### Singleton `textlint` → `createLinter()`

**Before (v14 and earlier):**
```javascript
const { textlint } = require("textlint");

textlint.setupRules({ "rule-name": ruleModule });
const result = await textlint.lintText("text", "file.md");
```

**After (v15+):**
```javascript
import { createLinter } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";

const descriptor = new TextlintKernelDescriptor({
    rules: [{ ruleId: "rule-name", rule: ruleModule }]
});
const linter = createLinter({ descriptor });
const result = await linter.lintText("text", "file.md");
```

## Benefits of the New API

1. **Modern ESM Support**: The new APIs support both CommonJS and ES modules
2. **Better TypeScript Support**: Improved type definitions and inference
3. **Cleaner Architecture**: Separation of concerns between configuration loading and linting
4. **More Flexible**: Easier to customize and extend for different use cases
5. **Better Testing**: Each component can be tested independently
6. **Reduced Bundle Size**: Significantly smaller codebase (-4,147 lines)

## Migration Guide

### Quick Reference

| Deprecated API | New API | Method Change |
|----------------|---------|---------------|
| `new TextLintEngine()` | `createLinter()` | `executeOnFiles()` → `lintFiles()` |
| `new TextFixEngine()` | `createLinter()` | `executeOnFiles()` → `fixFiles()` |
| `new TextLintCore()` | `createLinter()` | `lintText()` → `lintText()` |
| `engine.formatResults()` | `loadLinterFormatter()` | Separate formatter loading |

### Common Migration Patterns

#### Pattern 1: Simple File Linting

**Before:**
```javascript
const { TextLintEngine } = require("textlint");
const engine = new TextLintEngine();
const results = await engine.executeOnFiles(["README.md"]);
```

**After:**
```javascript
import { createLinter, loadTextlintrc } from "textlint";
const descriptor = await loadTextlintrc();
const linter = createLinter({ descriptor });
const results = await linter.lintFiles(["README.md"]);
```

#### Pattern 2: Text Processing with Custom Rules

**Before:**
```javascript
const { TextLintCore } = require("textlint");
const textlint = new TextLintCore();
textlint.setupRules({ "my-rule": myRule });
const result = await textlint.lintText("text", "file.md");
```

**After:**
```javascript
import { createLinter } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";

const descriptor = new TextlintKernelDescriptor({
    rules: [{ ruleId: "my-rule", rule: myRule }]
});
const linter = createLinter({ descriptor });
const result = await linter.lintText("text", "file.md");
```

#### Pattern 3: Mixing Configuration and Custom Rules

**Before:**
```javascript
const { TextLintCore } = require("textlint");
const { Config } = require("textlint/lib/config/config");

const config = new Config({ configFile: ".textlintrc.json" });
const textlint = new TextLintCore(config);
textlint.setupRules({ "custom-rule": customRule });
```

**After:**
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

## Common Pitfalls

### 1. File Extension for `lintText()`

The new `lintText()` method requires a file extension hint:

```javascript
// ❌ Bad - no extension
await linter.lintText("# Title", "unknown");

// ✅ Good - with extension
await linter.lintText("# Title", "document.md");
```

### 2. Module Loading

Use `moduleInterop()` for proper module loading:

```javascript
import { moduleInterop } from "@textlint/module-interop";

const rule = moduleInterop((await import("./my-rule")).default);
```

### 3. Formatter Usage

Formatters are now loaded separately:

```javascript
import { loadLinterFormatter } from "textlint";

const formatter = await loadLinterFormatter({ formatterName: "stylish" });
const output = formatter.format(results);
```

## Resources

- [New API Documentation](https://textlint.org/docs/use-as-modules.html#new-apis)
- [Working Example](https://github.com/textlint/textlint/tree/master/examples/use-as-module)
- [GitHub Issues](https://github.com/textlint/textlint/issues) - For migration support

## Conclusion

textlint v15 represents a significant step forward in modernizing the API surface while maintaining the powerful linting capabilities that users expect. While the migration requires some code changes, the new API provides better TypeScript support, modern ESM compatibility, and a cleaner architecture that will serve as a solid foundation for future development.

We encourage all users to migrate to the new APIs as soon as possible. The deprecated APIs have been removed, so upgrading to v15 will require code changes. However, the migration is straightforward, and the benefits of the new API make it worthwhile.

Thank you for your continued support of textlint!
