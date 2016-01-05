# Formatter

Pass following object to reporter module .

```js
var results = [
    // TextLintResult object
    {
        filePath: "./myfile.js",
        messages: [
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

## How to get source code from result?

You can read the source code from `filePath` property or `raw` property of `Document` node.

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

## Built-in

[textlint/textlint-formatter](https://github.com/textlint/textlint-formatter "textlint/textlint-formatter")
