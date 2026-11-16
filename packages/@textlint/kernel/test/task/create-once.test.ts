import { describe, it } from "vitest";
import assert from "node:assert";
import type { TextlintRuleContext, TextlintRuleReporter, TextlintRuleReportHandler } from "@textlint/types";
import { TextlintKernel } from "../../src/textlint-kernel.js";
import { createPluginStub } from "../helper/ExamplePlugin.js";

const { plugin } = createPluginStub({ extensions: [".md"] });
const plugins = [{ pluginId: "markdown", plugin }];

/**
 * A rule that has `createOnce`, and a rule function that delegates to it for textlint versions without `createOnce`.
 */
const defineRule = (
    createOnce: (context: Readonly<TextlintRuleContext>, options?: object) => TextlintRuleReportHandler
): TextlintRuleReporter => {
    const rule: TextlintRuleReporter = (context, options) => createOnce(context, options);
    rule.createOnce = createOnce;
    return rule;
};

/**
 * Count the calls of `createOnce` and of the rule function.
 * The rule reports the number of headers in each file at `Document:exit`.
 */
const createHeaderCountRule = () => {
    const calls = { createOnce: 0, ruleFunction: 0 };
    const createOnce = (context: Readonly<TextlintRuleContext>) => {
        calls.createOnce++;
        const { Syntax, report, RuleError } = context;
        let count = 0;
        return {
            [Syntax.Document]() {
                count = 0;
            },
            [Syntax.Header]() {
                count++;
            },
            [`${Syntax.Document}:exit`](node: Parameters<typeof report>[0]) {
                report(node, new RuleError(`headers: ${count}`));
            }
        };
    };
    const rule: TextlintRuleReporter = (context, options) => {
        calls.ruleFunction++;
        return createOnce(context);
    };
    rule.createOnce = createOnce;
    return { rule, calls };
};

const lint = (
    kernel: TextlintKernel,
    text: string,
    filePath: string,
    rules: { ruleId: string; rule: unknown; options?: unknown }[]
) => {
    return kernel.lintText(text, {
        filePath,
        ext: ".md",
        plugins,
        rules: rules as Parameters<TextlintKernel["lintText"]>[1]["rules"]
    });
};

describe("createOnce", () => {
    it("calls createOnce one time for the same rule entry, and the listeners for every file", async () => {
        const kernel = new TextlintKernel();
        const { rule, calls } = createHeaderCountRule();
        const rules = [{ ruleId: "header-count", rule }];
        const results = await Promise.all([
            lint(kernel, "# a\n\n# b\n", "/a.md", rules),
            lint(kernel, "# c\n", "/b.md", rules),
            lint(kernel, "text\n", "/c.md", rules)
        ]);
        assert.deepStrictEqual(calls, { createOnce: 1, ruleFunction: 0 });
        assert.deepStrictEqual(
            results.map((result) => [result.filePath, result.messages.map((message) => message.message)]),
            [
                ["/a.md", ["headers: 2"]],
                ["/b.md", ["headers: 1"]],
                ["/c.md", ["headers: 0"]]
            ]
        );
    });

    it("returns the same messages as the rule function for every file", async () => {
        const text = "# a\n\n# b\n";
        const { rule } = createHeaderCountRule();
        const ruleFunction: TextlintRuleReporter = (context) => rule.createOnce!(context);
        const once = await lint(new TextlintKernel(), text, "/a.md", [{ ruleId: "header-count", rule }]);
        const perFile = await lint(new TextlintKernel(), text, "/a.md", [
            { ruleId: "header-count", rule: ruleFunction }
        ]);
        assert.deepStrictEqual(once.messages, perFile.messages);
    });

    it("creates the rule for each rule entry, with its options and rule id", async () => {
        const kernel = new TextlintKernel();
        const received: unknown[] = [];
        const rule = defineRule((context, options) => {
            received.push([context.id, options]);
            return {
                [context.Syntax.Document](node) {
                    context.report(node, new context.RuleError(JSON.stringify(options)));
                }
            };
        });
        const rules = [
            { ruleId: "one", rule, options: { value: 1 } },
            { ruleId: "two", rule, options: { value: 2 } }
        ];
        await lint(kernel, "text", "/a.md", rules);
        const result = await lint(kernel, "text", "/b.md", rules);
        assert.deepStrictEqual(received, [
            ["one", { value: 1 }],
            ["two", { value: 2 }]
        ]);
        assert.deepStrictEqual(
            result.messages.map((message) => [message.ruleId, message.message]),
            [
                ["one", '{"value":1}'],
                ["two", '{"value":2}']
            ]
        );
    });

    it("creates the rule again for new rule entries", async () => {
        const kernel = new TextlintKernel();
        const { rule, calls } = createHeaderCountRule();
        await lint(kernel, "# a", "/a.md", [{ ruleId: "header-count", rule }]);
        await lint(kernel, "# a", "/a.md", [{ ruleId: "header-count", rule }]);
        assert.strictEqual(calls.createOnce, 2);
    });

    it("reports to the file being linted, with getSource and getFilePath of that file", async () => {
        const kernel = new TextlintKernel();
        const rule = defineRule((context) => {
            // keep the methods, as rules often do
            const { Syntax, RuleError, report, getSource, getFilePath } = context;
            return {
                [Syntax.Str](node) {
                    report(node, new RuleError(`${getFilePath()}: ${getSource(node)}`));
                }
            };
        });
        const rules = [{ ruleId: "source", rule }];
        const [a, b] = await Promise.all([
            lint(kernel, "first", "/a.md", rules),
            lint(kernel, "line\n\nsecond", "/b.md", rules)
        ]);
        assert.deepStrictEqual(
            a.messages.map((message) => [message.message, message.line, message.column]),
            [["/a.md: first", 1, 1]]
        );
        assert.deepStrictEqual(
            b.messages.map((message) => [message.message, message.line, message.column]),
            [
                ["/b.md: line", 1, 1],
                ["/b.md: second", 3, 1]
            ]
        );
    });

    it("gives the values that do not depend on a file in createOnce", async () => {
        const kernel = new TextlintKernel();
        let values: unknown[] = [];
        const rule = defineRule((context) => {
            values = [
                context.id,
                context.severity,
                typeof context.Syntax.Document,
                typeof context.RuleError,
                typeof context.fixer.replaceText,
                typeof context.locator.range
            ];
            return {};
        });
        await lint(kernel, "text", "/a.md", [{ ruleId: "values", rule }]);
        assert.deepStrictEqual(values, ["values", 2, "string", "function", "function", "function"]);
    });

    it("throws an error with the rule id when createOnce calls a method that needs a file", async () => {
        const kernel = new TextlintKernel();
        const rule = defineRule((context) => {
            context.getSource();
            return {};
        });
        await assert.rejects(lint(kernel, "text", "/a.md", [{ ruleId: "early-source", rule }]), (error: Error) => {
            assert.match(error.message, /Error while loading rule 'early-source'/);
            assert.match(error.message, /context\.getSource\(\) outside its listeners/);
            return true;
        });
    });

    it("fails the lint when a listener returns a Promise", async () => {
        const kernel = new TextlintKernel();
        const rule = defineRule((context) => {
            return {
                async [context.Syntax.Str](node) {
                    context.report(node, new context.RuleError("late"));
                }
            };
        });
        await assert.rejects(lint(kernel, "text", "/a.md", [{ ruleId: "async-rule", rule }]), (error: Error) => {
            assert.match(error.message, /Rule 'async-rule' returned a Promise from the 'Str' listener/);
            return true;
        });
    });

    it("calls the rule function for every file when it does not have createOnce", async () => {
        const kernel = new TextlintKernel();
        let count = 0;
        const rule: TextlintRuleReporter = () => {
            count++;
            return {};
        };
        const rules = [{ ruleId: "plain", rule }];
        await lint(kernel, "a", "/a.md", rules);
        await lint(kernel, "b", "/b.md", rules);
        assert.strictEqual(count, 2);
    });

    it("applies the fixes of a fixable rule with createOnce", async () => {
        const kernel = new TextlintKernel();
        let created = 0;
        const createOnce = (context: Readonly<TextlintRuleContext>): TextlintRuleReportHandler => {
            created++;
            const { Syntax, RuleError, report, fixer, getSource } = context;
            return {
                [Syntax.Str](node) {
                    const text = getSource(node);
                    const index = text.indexOf("bad");
                    if (index !== -1) {
                        report(
                            node,
                            new RuleError("bad", { index, fix: fixer.replaceTextRange([index, index + 3], "good") })
                        );
                    }
                }
            };
        };
        const linter = defineRule(createOnce);
        const fixer = defineRule(createOnce);
        const rules = [{ ruleId: "fix-bad", rule: { linter, fixer } }];
        const options = { ext: ".md", plugins, rules } as Parameters<TextlintKernel["fixText"]>[1];
        const first = await kernel.fixText("bad text\n\nbad", { ...options, filePath: "/a.md" });
        const second = await kernel.fixText("a bad", { ...options, filePath: "/b.md" });
        assert.strictEqual(first.output, "good text\n\ngood");
        assert.strictEqual(second.output, "a good");
        // one for the fix; the lint was not run
        assert.strictEqual(created, 1);
    });
});
