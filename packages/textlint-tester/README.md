# textlint-tester [![Build Status](https://travis-ci.org/textlint/textlint-tester.svg?branch=master)](https://travis-ci.org/textlint/textlint-tester)

[Mocha](http://mochajs.org/ "Mocha") test helper library for [textlint](https://github.com/textlint/textlint "textlint") rule.

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

`test/example-test.js`:

```js
var TextLintTester = require("textlint-tester");
var tester = new TextLintTester();
// rule
var noTodo = require("textlint-rule-no-todo");
// ruleName, rule, { valid, invalid }
tester.run("no-todo", noTodo, {
    valid: [
        "string, test desu",
        {
            // text with options
            text: "日本語 is Japanese.",
            options: {
                "key": "value"
            }
        }
    ],
    invalid: [
        {
            text: "- [ ] string",
            errors: [
                {
                    message: "found TODO: '- [ ] string'"
                }
            ]
        },
        {
            text: "TODO: string",
            options: {"key": "value"},
            errors: [
                {
                    message: "found TODO: 'TODO: string'",
                    line: 1,
                    column: 1
                }
            ]
        }
    ]
});
```

Run the tests:

```sh
mocha test/
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
