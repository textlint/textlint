---
id: plugin
title: Plugin
---

Each plugin is an npm module with a name in the format of `textlint-plugin-<plugin-name>`.
For example, `@textlint/textlint-plugin-markdown` is a textlint plugin.

## Processor

Plugin has a `Processor` that is required.

```js
// index.js
export default {
    Processor: require("./YourProcessor")
};
```

`Processor` class defined pre/post process of the file and available file types.

textlint support `.txt` and `.md` by default. These are implemented as `Processor` plugin.

- [@textlint/textlint-plugin-markdown](https://github.com/textlint/textlint/tree/master/packages/@textlint/textlint-plugin-markdown)
- [@textlint/textlint-plugin-text](https://github.com/textlint/textlint/tree/master/packages/@textlint/textlint-plugin-text)
- [textlint/textlint-plugin-html](https://github.com/textlint/textlint-plugin-html)

`Processor` class example code:

```js
// TextProcessor.js
import { parse } from "txt-to-ast";
export default class TextProcessor {
    constructor(options = {}) {
        this.options = options;
        // support "extension" option
        this.extensions = this.config.extensions ? this.config.extensions : [];
    }
    // available ".ext" list
    // user can add own custom extension as "extensions" option
    availableExtensions() {
        return [".txt", ".text"].concat(this.extensions);
    }
    // define pre/post process
    // in other words, parse and generate process
    processor(ext) {
        return {
            preProcess(text, filePath) {
                // parsed result is an AST object
                // AST is consist of TxtNode
                // https://github.com/textlint/textlint/blob/master/docs/txtnode.md
                return parse(text);
            },
            postProcess(messages, filePath) {
                return {
                    messages,
                    filePath: filePath ? filePath : "<text>"
                };
            }
        };
    }
}
```

`Processor` class should implement these methods.

### `availableExtensions(): string[]`

It should return supported extension name list.

Notes: 

textlint@10<= support `static availableExtensions(): string[]`.
The static method is deprecated in textlint@11.
you should implement `availableExtensions()` method as instance method.

### `processor(ext)`

`processor()` method should return an object that have `preProcess` and `postProcess` method.

#### `preProcess(text, filePath): TxtParentNode | { text: string; ast: TxtParentNode; }`

`preProcess` method should return `TxtParentNode` object or `{ text: string, ast: TxtParentNode }` object.
`TxtParentNode` object is an Abstract Syntax Tree (AST) of the text.

You should check the AST using [@textlint/ast-tester](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-tester "@textlint/ast-tester").

- [textlint/@textlint/ast-tester: Compliance tests for textlint's AST](https://github.com/textlint/textlint/tree/master/packages/@textlint/ast-tester)

```js
import { test, isTextlintAST } from "@textlint/ast-tester";
// your implement
import yourParse from "your-parser";
// recommenced: test much pattern test
const AST = yourParse("This is text");

// Validate AST
test(AST); // if the AST is invalid, then throw Error

isTextlintAST(AST); // true or false
```

If you want know `TxtParentNode`, see [TxtAST interface documents](txtnode.md).

##### text format

> Target file(text format) -> AST(by your plugin) for Target file

If your plugin handle text format, you can just return a `TxtParentNode` object.

```js
class ExampleProcessor {
    availableExtensions() {
        return [".example"];
    }

    processor() {
        return {
            preProcess() {
                return AST_OBJECT;
            },
            postProcess(messages, filePath) {
                return {
                    filePath: filePath || "<example>",
                    messages
                };
            }
        };
    }
}
```

##### binary format

> Target file(binary format) -> Intermediate text(by your plugin) -> AST(by your plugin) for Intermediate text

If your plugin handle intermediate text, you should return a `{ text: string, ast: TxtParentNode }` object.
textlint can not handle a binary format, and your plugin should return intermediate text for your AST.

```js
class BinaryExampleProcessor {
    availableExtensions() {
        return [".binary-example"];
    }

    processor() {
        return {
            preProcess() {
                return {
                    text: PASUDUE_TEXT,
                    ast: AST_OBJECT
                };
            },
            postProcess(messages, filePath) {
                return {
                    filePath: filePath || "<example>",
                    messages
                };
            }
        };
    }
}
```

For more details, see <https://github.com/textlint/textlint/issues/649>

#### `postProcess(messages, filePath)`

`postProcess` method should return `{ messages, filePath }`.
`filePath` argument may be undefined when text was input from stdin. 

## Plugin configuration

You can use Processor plugin in the same way a plugin.

```
{
    "plugins": [
        "<Processor Plugin>"
    ]
}
```

### options 

You can pass options to your plugin from `.textlintrc`.

```
{
    "plugins": {
        "pluginName": processorOption
    }
}
```

You can receive the `processorOption` via constructor arguments.

```js
export default class YourProcessor {
    constructor(options) {
        this.options = options; // <= processorOption!
    }
    // ...
}
```

:memo: Processor's option value is `{}` (empty object) by default.
If not set plugin's option in `.textlintrc`, textlint pass `{}` as `options`.

```js
export default class YourProcessor {
    constructor(options) {
        this.options = options; // {}
    }
    // ...
}
```

## Publishing

If you want to publish your textlint plugin, see following documents.

### Package name convention

textlint plugin package naming should have `textlint-plugin-` prefix.

- `textlint-plugin-<name>`
- `@scope/textlint-plugin-<name>`
    - textlint supports [Scoped packages](https://docs.npmjs.com/misc/scope "Scoped packages")

Example: `@textlint/textlint-plugin-markdown`

textlint user use it by setting following:

```json
{
    "plugins": {
        "@textlint/markdown": true
    }
}
```

Also, textlint user can set options to the plugin.
      
```json
{
  "plugins": {
      "@textlint/markdown": {
        "extensions": [".custom-ext"]
      }
  }
}
```

### Keywords

You should add `textlintplugin` to npm's `keywords`

```json
{
  "name": "textlint-plugin-format-name",
  "keywords": [
    "textlintplugin"
  ]
}
```

## Plugin Example

(limited) XML plugin

- [azu/textlint-plugin-xml-example](https://github.com/azu/textlint-plugin-xml-example "azu/textlint-plugin-xml-example")

For more plugins, See [Processor Plugin List](https://github.com/textlint/textlint/wiki/Collection-of-textlint-rule#processor-plugin-list "Processor Plugin List").

### Built-in plugin

textlint has built-in plugins

- [`@textlint/textlint-plugin-text`](https://github.com/textlint/textlint/tree/master/packages/@textlint/textlint-plugin-text)
- [`@textlint/textlint-plugin-markdown`](https://github.com/textlint/textlint/tree/master/packages/@textlint/textlint-plugin-markdown)
