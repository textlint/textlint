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
                // parsed result is a AST object
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

`Processor` class should implement these method.

### `availableExtensions(): string[]`

It should return supported extension name list.

Notes: 

textlint@10<= support `static availableExtensions(): string[]`.
The static method is deprecated in textlint@11.
you should implement `availableExtensions()` method as instance method.

### `processor(ext)`

`processor()` method should return a object that have `preProcess` and `postProcess` method.

#### `preProcess(text, filePath)`

`preProcess` method should return `TxtAST` object.
`TxtAST` object is a Abstract Syntax Tree(AST) of the text.

:information_source: For more details about `TxtAST`, see [TxtAST interface documents](txtnode.md).

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

You can pass a options to your plugin from `.textlintrc`.

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
