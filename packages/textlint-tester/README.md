# textlint-tester

[Mocha](http://mochajs.org/ "Mocha") test helper library
for [textlint](https://github.com/textlint/textlint "textlint") [rule](https://textlint.github.io/docs/rule.html).

## Installation

    npm install --save-dev textlint-tester mocha

## Usage

1. Write tests by using `textlint-tester`

```js
import TextLintTester from "textlint-tester";
// a rule for testing
import rule from "textlint-rule-no-todo";

const tester = new TextLintTester();
// ruleName, rule, { valid, invalid }
tester.run("rule name", rule, {
    valid: [
        "This is ok",
    ],
    invalid: [
        // line, column
        {
            text: "- [ ] string",
            errors: [
                {
                    message: "Found TODO: '- [ ] string'",
                    range: [2, 6]
                }
            ]
        }
    ]
});
```

2. Run tests by [Mocha](http://mochajs.org/ "Mocha")

```sh
$(npm bin)/mocha test/
```

### TextLintTester

`TextLintTester#run` has two signatures.

- If you want to test single rule, use first method (`TextLintTester#run(ruleName, rule, {valid=[], invalid=[]})`)
- If you want to test multiple rules and/or plugins, use second
  method (`TextLintTester#run(testName, testConfig, {valid=[], invalid=[]})`)

#### TextLintTester#run(ruleName, rule, {valid=[], invalid=[]})

- `{string} ruleName` ruleName is a name of the rule.
- `{TextlintRuleCreator} rule` rule is textlint rule.

#### TextLintTester#run(testName, testConfig, {valid=[], invalid=[]})

- `{string} testName` testName is a name of the test.
- `{TestConfig} testConfig` testConfig is the configuration object for the test.

##### TestConfig object

`TestConfig` is defined as follows:

```typescript
export declare type TestConfig = {
    plugins?: {
        pluginId: string; // name of plugin
        plugin: TextlintPluginCreator; // textlint plugin
        options?: any; // options for plugin
    }[];
    rules: {
        ruleId: string; // name of rule
        rule: TextlintRuleCreator; // textlint rule
        options?: any; // options for rule
    }[];
};
```

`testConfig` object example:

```js
tester.run("rule name", {
    plugins: [
        {
            pluginId: "html",
            plugin: htmlPlugin // = require("textlint-plugin-html")
        }
    ],
    rules: [
        {
            ruleId: "no-todo",
            rule: noTodoRule // = require("textlint-rule-no-todo").default
        },
        {
            ruleId: "max-number-of-lines",
            rule: maxNumberOfLineRule, // = require("textlint-rule-max-number-of-lines")
            options: {
                max: 2
            }
        }
    ]
}, { ... })
```

##### valid object

- `{string[]|object[]} valid` valid is an array of text which should be passed.
    - You can use `object` if you want to specify some options. `object` can have the following properties:
        - `{string} text`: a text to be linted
        - `{string} ext`: an extension key. Default: `.md` (Markdown)
        - `{string} inputPath`: a test text filePath that prefer to `text` property
        - `{object} options`: options to be passed to the rule. Will throw assertion error if `testConfig` is specified

TypeScript declaration is for valid as follows:

```typescript
export declare type TesterValid = string | {
    text?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
};
```

`valid` object example:

```js
test.run("test name", rule, {
    valid: [
        "text",
        { text: "text" },
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
});
```

##### invalid object

- `{object[]} invalid` invalid is an array of object which should be failed.
    - `object` can have the following properties:
        - `{string} text`: a text to be linted.
        - `{string} inputPath`: a test text filePath that prefer to `text` property.
        - `{string} output`: a fixed text.
        - `{string} ext`: an extension key.
        - `{object[]} errors`: an array of error objects which should be raised against the text.
        - `{object} options`: options to be passed to the rule. Will throw assertion error if `testConfig` is specified

TypeScript's declaration is as follows:

```typescript
export declare type TesterInvalid = {
    text?: string;
    output?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
    errors: {
        ruleId?: string;
        range?: readonly [startIndex: number, endIndex: number];
        loc?: {
            start: {
                line: number;
                column: number;
            };
            end: {
                line: number;
                column: number;
            };
        };
        /**
         * @deprecated use `range` option
         */
        index?: number;
        /**
         * @deprecated use `loc` option
         */
        line?: number;
        /**
         * @deprecated use `loc` option
         */
        message?: string;
        [index: string]: any;
    }[];
};
```

`invalid` object example:

```js
test.run("rule name", rule, {
    invalid:
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
})
```

### Example

`test/example-test.js`:

```js
import TextLintTester from "textlint-tester";
// a rule for testing
import rule from "textlint-rule-no-todo";

const tester = new TextLintTester();
// ruleName, rule, { valid, invalid }
tester.run("no-todo", rule, {
    valid: [
        "This is ok",
        {
            // text with options
            text: "This is test",
            options: {
                "key": "value"
            }
        }
    ],
    invalid: [
        // range
        {
            inputPath: path.join(__dirname, "fixtures/text/ng.md"),
            errors: [
                {
                    message: "Found TODO: '- [ ] This is NG'",
                    range: [2, 6]
                }
            ]
        },
        // loc
        {
            inputPath: path.join(__dirname, "fixtures/text/ng.md"),
            errors: [
                {
                    message: "Found TODO: '- [ ] This is NG'",
                    loc: {
                        start: {
                            line: 1,
                            column: 2
                        },
                        end: {
                            line: 1,
                            column: 6
                        }
                    }
                }
            ]
        },
        // Depreacted way
        // line, column
        {
            text: "- [ ] string",
            errors: [
                {
                    message: "Found TODO: '- [ ] string'",
                    line: 1,
                    column: 3
                }
            ]
        },
        // index
        {
            text: "- [ ] string",
            errors: [
                {
                    message: "Found TODO: '- [ ] string'",
                    index: 2
                }
            ]
        },
        {
            text: "TODO: string",
            options: { "key": "value" },
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

See [`textlint-tester-test.ts`](./test/textlint-tester-test.ts)
or [`textlint-tester-plugin.ts`](./test/textlint-tester-plugin.ts) for concrete examples.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
