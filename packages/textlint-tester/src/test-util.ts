import * as assert from "assert";
import * as fs from "fs/promises";
import { TextlintResult } from "@textlint/kernel";
import { TesterErrorDefinition } from "./textlint-tester";

export type TestTextlintLinter = {
    lintText(text: string, ext: string): Promise<TextlintResult>;
    lintFile(filePath: string): Promise<TextlintResult>;
};

type TestTestArgs =
    | {
          inputPath: string;
      }
    | {
          text: string;
          ext: string;
      };

/**
 * validate and get text
 * @returns {string}
 */
async function getTestText(args: TestTestArgs) {
    if ("inputPath" in args && typeof args.inputPath === "string") {
        return fs.readFile(args.inputPath, "utf-8");
    }
    if ("text" in args && typeof args.text === "string") {
        return args.text;
    }
    throw new Error("should be defined { text } or { inputPath }");
}

export type InvalidPatternArgs =
    | {
          textlint: TestTextlintLinter;
          inputPath: string;
          errors: TesterErrorDefinition[];
      }
    | {
          textlint: TestTextlintLinter;
          errors: TesterErrorDefinition[];
          text: string;
          ext: string;
      };

/**
 * Test invalid pattern
 * @param args
 */
export async function testInvalid(args: InvalidPatternArgs) {
    const textlint = args.textlint;
    const errors = args.errors;
    const actualText = await getTestText(args);
    const lines = actualText.split(/\n/);
    assert.strictEqual(
        typeof actualText,
        "string",
        `invalid property should have text string
e.g.)
invalid : [
    {
        text: "example text",
        errors: [{
            message: "expected message"
        }]
    }
]
`
    );
    assert.ok(
        Array.isArray(errors),
        `invalid property should have array of expected error
e.g.)
invalid : [
    {
        text: "example text",
        errors: [{
            message: "expected message"
        }]
    }
]
            `
    );
    const errorLength = errors.length;
    let promise: Promise<TextlintResult>;
    if ("inputPath" in args && args.inputPath !== undefined) {
        promise = textlint.lintFile(args.inputPath);
    } else if ("text" in args && args.text !== undefined) {
        const { text, ext } = args;
        promise = textlint.lintText(text, ext);
    } else {
        throw new Error("Should set `text` or `inputPath`");
    }
    return promise.then((lintResult) => {
        assert.strictEqual(
            lintResult.messages.length,
            errorLength,
            `invalid: should have ${errorLength} errors but had ${lintResult.messages.length}:
===Text===:
${actualText}

==Result==:
${JSON.stringify(lintResult, null, 4)}`
        );
        errors.forEach((error, errorIndex) => {
            const { ruleId, message, line, column, index, range, loc } = error;
            const resultMessageObject = lintResult.messages[errorIndex];
            // check
            assert.ok(
                resultMessageObject.line >= 1,
                `lint result's line number is ${resultMessageObject.line}, should be over than 1.`
            );
            assert.ok(
                resultMessageObject.line <= lines.length,
                `lint result's line number is line:${resultMessageObject.line}, but total line number of the text is ${lines.length}.
The result's line number should be less than ${lines.length}`
            );
            const columnText = lines[resultMessageObject.line - 1];
            assert.ok(
                resultMessageObject.column >= 1,
                `lint result's column number is ${resultMessageObject.column}, should be over than 1.`
            );
            assert.ok(
                resultMessageObject.column <= columnText.length + 1,
                `lint result's column number is ${resultMessageObject.column},` +
                    `but the length of the text @ line:${resultMessageObject.line} is ${columnText.length + 1}.
The result's column number should be less than ${columnText.length + 1}`
            );
            if (ruleId !== undefined) {
                const resultRuleId = resultMessageObject.ruleId;
                assert.strictEqual(resultRuleId, ruleId, `"ruleId should be "${ruleId}"`);
            }
            if (message !== undefined) {
                const resultMessage = resultMessageObject.message;
                assert.strictEqual(resultMessage, message, `"message should be "${message}"`);
            }
            if (line !== undefined) {
                const resultLine = resultMessageObject.line;
                assert.strictEqual(resultLine, line, `line should be ${line}`);
            }
            if (column !== undefined) {
                const resultColumn = resultMessageObject.column;
                assert.strictEqual(resultColumn, column, `"column should be ${column}`);
            }
            if (index !== undefined) {
                const resultIndex = resultMessageObject.index;
                assert.strictEqual(resultIndex, index, `"index should be ${index}`);
            }
            if (range !== undefined) {
                const resultRange = resultMessageObject.range;
                assert.deepStrictEqual(resultRange, range, `"range should be ${JSON.stringify(range, null, 4)}`);
            }
            if (loc !== undefined) {
                const resultLoc = resultMessageObject.loc;
                assert.deepStrictEqual(resultLoc, loc, `"loc should be ${JSON.stringify(loc, null, 4)}`);
            }
        });
    });
}

export type ValidPatternArgs =
    | {
          textlint: TestTextlintLinter;
          inputPath: string;
      }
    | {
          textlint: TestTextlintLinter;
          text: string;
          ext: string;
      };

export async function testValid(args: ValidPatternArgs) {
    const { textlint } = args;
    const actualText = await getTestText(args);
    assert.strictEqual(typeof actualText, "string", "valid should has string or { text }.");
    let promise: Promise<TextlintResult>;
    if ("inputPath" in args && args.inputPath !== undefined) {
        promise = textlint.lintFile(args.inputPath);
    } else if ("text" in args && args.text !== undefined) {
        promise = textlint.lintText(args.text, args.ext);
    } else {
        throw new Error("Should set `text` or `inputPath`");
    }
    return promise.then((results) => {
        assert.strictEqual(
            results.messages.length,
            0,
            `valid: should have no errors but had Error results:
===Text===:
${actualText}

==Result==:
${JSON.stringify(results, null, 4)}`
        );
    });
}
