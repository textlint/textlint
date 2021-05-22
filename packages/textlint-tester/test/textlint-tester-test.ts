import * as path from "path";
import TextLintTester from "../src/index";
// @ts-expect-error: no types
import noTodo from "textlint-rule-no-todo";
// @ts-expect-error: no types
import maxNumberOfLine from "textlint-rule-max-number-of-lines";

const tester = new TextLintTester();
tester.run("no-todo", noTodo, {
    valid: [
        "string, test desu",
        {
            text: "日本語 is Japanese."
        },
        {
            text: "- [ ] This text is parsed as plain text.",
            ext: ".txt"
        },
        {
            inputPath: path.join(__dirname, "fixtures/text/ok.md")
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
            errors: [
                {
                    message: "Found TODO: 'TODO: string'",
                    line: 1,
                    column: 1
                }
            ]
        },
        {
            text: "- [ ] TODO: this text is parsed as plain text.",
            ext: ".txt",
            errors: [
                {
                    message: "Found TODO: 'TODO: this text is parsed as plain text.'",
                    line: 1,
                    column: 7
                }
            ]
        },
        {
            inputPath: path.join(__dirname, "fixtures/text/ng.md"),
            errors: [
                {
                    message: "Found TODO: '- [ ] This is NG'",
                    index: 2
                }
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
3`,
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
