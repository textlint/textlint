# textlint-tester [![Build Status](https://travis-ci.org/textlint/textlint-tester.svg?branch=master)](https://travis-ci.org/textlint/textlint-tester)

[Mocha](http://mochajs.org/ "Mocha") test helper library for [textlint](https://github.com/textlint/textlint "textlint") rule.

## Installation

    npm install -D textlint-tester mocha

## Usage

1. Write tests by using `textlint-tester`
2. Run tests by [Mocha](http://mochajs.org/ "Mocha")

### TextLintTester

#### TextLintTester#run(ruleName, rule, {valid=[], invalid=[]})

- `{string} ruleName` ruleName is a name of the rule.
- `{Function} rule` rule is the exported function of the rule.
- `{string[]|object[]} valid` valid is an array of text which should be passed.
    - You can use `object` if you want to specify some options. `object` can have the following properties:
        - `{string} text`: a text to be linted
        - `{object} options`: options to be passed to the rule
        - `{string} ext`: an extension key. Default: `.md` (Markdown)

`valid` object example:

```js
[
    "text",
    { text : "text" },
    {
        text: "text",
        options: {
            "key": "value",
        },
    },
    {
        text: "<p>this sentence is parsed as HTML document.</p>",
        ext: ".html",
    },
]
```

- `{object[]} invalid` invalid is an array of object which should be failed.
    - `object` can have the following properties:
        - `{string} text`: a text to be linted.
        - `{string} output`: a fixed text.
        - `{string} ext`: an extension key.
        - `{object[]} errors`: an array of error objects which should be raised againt the text.

`invalid` object example:

```js
[
    {
        text: "text",
        output: "text",
        ext: ".txt",
        errors: [
            {
                messages: "expected message",
                line: 1,
                column: 1
            }
        ]
    }
]
```

### Example

`test/example-test.js`:

```js
var TextLintTester = require("textlint-tester");
var tester = new TextLintTester();
// rule
var rule = require("textlint-rule-no-todo");
// ruleName, rule, { valid, invalid }
tester.run("no-todo", rule, {
    valid: [
        "this is test",
        {
            // text with options
            text: "this is test",
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
        },
        {
         text: "TODO: string",
         output: "string", // <= fixed output
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
$(npm bin)/mocha test/
```

## Tests

    $(npm bin)/mocha test/
    # npm test

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
