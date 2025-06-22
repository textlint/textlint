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

## Resources

- [New API Documentation](https://textlint.org/docs/use-as-modules.html#new-apis)
- [Working Example](https://github.com/textlint/textlint/tree/master/examples/use-as-module)
- [Kernel API Documentation](https://github.com/textlint/textlint/tree/master/packages/%40textlint/kernel)

## Support

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/textlint/textlint/issues)
2. Review the [Discussions](https://github.com/orgs/textlint/discussions)  
3. Create a new issue with your migration question

This migration enables textlint to provide a more modern, flexible, and maintainable API for the future.
