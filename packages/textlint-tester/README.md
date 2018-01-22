# textlint-tester

[Mocha](http://mochajs.org/ "Mocha") test helper library for [textlint](https://github.com/textlint/textlint "textlint") [rule](../../docs/rule.md).

## Installation

    npm install --save-dev textlint-tester mocha

## Usage

1. Write tests by using `textlint-tester`
2. Run tests by [Mocha](http://mochajs.org/ "Mocha")

```sh
$(npm bin)/mocha test/
```

### TextLintTester

`TextLintTester#run` has two signatures.

- If you want to test single rule, use first method (`TextLintTester#run(ruleName, rule, {valid=[], invalid=[]})`)
- If you want to test multiple rules and/or plugins, use second method (`TextLintTester#run(testName, testConfig, {valid=[], invalid=[]})`)

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
    plugins: {
        pluginId: string; // name of plugin
        plugin: TextlintPluginCreator; // textlint plugin
    }[];
    rules: {
        ruleId: string; // name of rule
        rule: TextlintRuleCreator; // textlint rule
    }[];
};
```

`testConfig` object example:

```js
{
    plugins: [
        {
            pluginId: "html",
            plugin: htmlPlugin // = require("textlint-plugin-html")
        }
    ],
    rules: [
        {
            ruleId: "no-todo",
            rule: noTodoRule // = require("textlint-rule-no-todo")

        }
    ]
}
```

##### valid object

- `{string[]|object[]} valid` valid is an array of text which should be passed.
    - You can use `object` if you want to specify some options. `object` can have the following properties:
        - `{string} text`: a text to be linted
        - `{string} ext`: an extension key. Default: `.md` (Markdown)
        - `{string} inputPath`: a test text filePath that prefer to `text` property
        - `{object} options`: options to be passed to the rule

TypeScript declaration is for valid as follows:

```typescript
export declare type TesterValid = string | {
    text?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
    pluginOptions?: any;
};
```

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

##### invalid object

- `{object[]} invalid` invalid is an array of object which should be failed.
    - `object` can have the following properties:
        - `{string} text`: a text to be linted.
        - `{string} inputPath`: a test text filePath that prefer to `text` property.
        - `{string} output`: a fixed text.
        - `{string} ext`: an extension key.
        - `{object[]} errors`: an array of error objects which should be raised againt the text.

TypeScript declaration is as follows:

```typescript
export declare type TesterInvalid = {
    text?: string;
    output?: string;
    ext?: string;
    inputPath?: string;
    options?: any;
    pluginOptions?: any;
    errors: {
        ruleId?: string;
        index?: number;
        line?: number;
        column?: number;
        message?: string;
        [index: string]: any;
    }[];
};
```

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
const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
// rule
const rule = require("textlint-rule-no-todo");
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

See [`textlint-tester-test.ts`](./test/textlint-tester-test.ts) or [`textlint-tester-plugin.ts`](./test/textlint-tester-plugin.ts) for concrete examples.


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
