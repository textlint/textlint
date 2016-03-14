# Formatter

## Result of linting

Pass following array of [TextLintResult](https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts "TextLintResult") to reporter module.

```js
// results of linting
var results = [
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

`TextLintMessage` and `TextLintResult` are defined in [textlint.d.ts](https://github.com/textlint/textlint/blob/master/typing/textlint.d.ts "textlint.d.ts").

It is compatible for [ESLint formatter](http://eslint.org/docs/developer-guide/working-with-custom-formatters "Documentation - ESLint - Pluggable JavaScript linter"). 

## How to get source code from result?

You can read the source code from `filePath` property.

## Built-in formatter

textlint use `textlint-formatter` module as built-in formatter.

- [textlint/textlint-formatter](https://github.com/textlint/textlint-formatter "textlint/textlint-formatter")

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
