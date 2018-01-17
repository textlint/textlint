---
id: formatter
title: Formatter
---

## Result of linting

Pass following array of `TextLintResult` to reporter module.

```js
// results of linting
const results = [
    // TextLintResult object
    {
        filePath: "./myfile.md",
        messages: [
            // TextLintMessage object
            {
                type: "lint",
                ruleId: "semi",
                line: 1,
                column: 23,
                message: "Expected a semicolon."
            }
        ]
    }
];
```

`TextLintMessage` and `TextLintResult` are defined as follows.

```typescript
export class TextlintMessage {
    // See src/shared/type/MessageType.js
    // Message Type
    type: string;
    // Rule Id
    ruleId: string;
    message: string;
    // optional data
    data?: any;
    // FixCommand
    fix?: TextlintFixCommand;
    // location info
    // Text -> AST TxtNode(0-based columns) -> textlint -> TextlintMessage(**1-based columns**)
    line: number; // start with 1
    column: number; // start with 1
    // indexed-location
    index: number; // start with 0
    // Severity Level
    // See src/shared/type/SeverityLevel.js
    severity: number;
}

// Linting result
export interface TextlintResult {
    filePath: string;
    messages: TextlintMessage[];
}

// "range" will be replaced by "text"
export class TextlintFixCommand {
    text: string;
    range: [number, number];
}
```

It is compatible for [ESLint formatter](https://eslint.org/docs/developer-guide/working-with-custom-formatters "Documentation - ESLint - Pluggable JavaScript linter"). 

### Simple usage from Command line

We can get the raw output to stdout using `json` formatter.

```sh
$ textlint --format json <file>
[
    // TextLintResult object
    {
        filePath: "./myfile.md",
        messages: [
            // TextLintMessage object
            {
                ruleId: "semi",
                line: 1,
                column: 23,
                message: "Expected a semicolon."
            }
        ]
    }
];
```

## Result of fixing

`textlint` support [fixable rule](./rule-fixable.md)

Fixable result is a bit difference for things of linting.

```js
// results of fixing
const results = [
    // TextLintFixResult
    {
        filePath: "./myfile.md",
        // fixed content string
        output: "fixed content",
        // applied fixable messages
        // messages is a array of `TextLintMessage`
        applyingMessages: [],
        // not fixable messages
        // messages is a array of `TextLintMessage`
        remainingMessages: [],
        // messages is the same one of `TextLintResult`
        // pre-applyingMessages + remainingMessages
        // messages is a array of `TextLintMessage`
        messages: []
    }
];
```

`TextLintFixResult` is defined as follows.

```typescript
// Fixing result
export interface TextlintFixResult {
    filePath: string;
    // fixed content
    output: string;
    // all messages = pre-applyingMessages + remainingMessages
    // it is same with one of `TextlintResult`
    messages: TextlintMessage[];
    // applied fixable messages
    applyingMessages: TextlintMessage[];
    // original means original for applyingMessages and remainingMessages
    // pre-applyingMessages + remainingMessages
    remainingMessages: TextlintMessage[];
}
```
It is not compatible for ESLint.

### Simple usage from Command line

We can get the raw output to stdout using `json` formatter.

```sh
$ textlint --fix --format json <file>
[
  {
    "filePath": "./myfile.md",
    "output": "content string",
    "messages": [],
    "applyingMessages": [],
    "remainingMessages": []
  }
]
```


## How to get source code from result?

You can read the source code from `filePath` property.

## Built-in formatter

textlint use `@textlint/linter-formatter` module as built-in formatter.

- [@textlint/linter-formatter](../packages/@textlint/linter-formatter/README.md "@textlint/linter-formatter")

## Custom Formatter

```sh
textlint -f <package-name>
```

e.g.) [textlint-formatter-codecov](https://github.com/azu/textlint-formatter-codecov/tree/a5b93248e9c1d5719684b16ff87342d8654e2aa0 "textlint-formatter-codecov")

```sh
textlint -f textlint-formatter-codecov
# ==
textlint -f codecov
```
