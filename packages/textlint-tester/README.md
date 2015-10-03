# textlint-tester

[Mocha](http://mochajs.org/ "Mocha") test helper library for [textlint](https://github.com/azu/textlint "textlint") rule.

## Installation

    npm install -D textlint-tester

## Usage

1. Write tests by using `textlint-tester`
2. Run tests by [Mocha](http://mochajs.org/ "Mocha")

### TextLintTester

#### TextLintTester#run(ruleName, rule, {valid=[], invalid=[]})

- `{string} ruleName` ruleName is name of thee rule
- `{Function} rule` rule is the function of rule
- `{string[]|object[]} valid`
    - e.g.) `["text", { text : "text" }]`
- `{object[]} invalid`
    - e.g.) `[{text: "text", errors: [ messages : "expected message" ]}`

### example

```js
var TextLintTester = require("textlint-tester");
// rules
var noTodo = require("textlint-rule-no-todo");
var maxNumberOfLine = require("textlint-rule-max-number-of-lines");
var tester = new TextLintTester();
// ruleName, rule, expected[]
tester.run("no-todo", noTodo, {
    valid: [
        "string, test desu",
        {
            text: "日本語 is Japanese."
        }
    ],
    invalid: [
        // text, expected errors
        {
            text: "- [ ] string",
            errors: [
                {message: "found TODO: '- [ ] string'"}
            ]
        },
        {
            text: "TODO: string",
            errors: [
                {message: "found TODO: 'TODO: string'"}
            ]
        }
    ]
});
tester.run("max-number-of-lines", maxNumberOfLine, {
    valid: [
        "string, test desu",
        {
            text: "日本語 is Japanese."
        }
    ],
    invalid: [
        {
            text: `1
2
3
`,
            options: {
                max: 2
            },
            errors: [
                {
                    ruleId: "max-number-of-lines",
                    message: "Document is too long(number of lines: 3)."
                }
            ]
        }

    ]
});
```

## Tests

    mocha test/
    # npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT