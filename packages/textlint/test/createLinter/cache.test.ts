import assert from "node:assert";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, it } from "vitest";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import type { TextlintPluginCreator, TextlintRuleModule, TextlintRuleReporter } from "@textlint/types";
import { createLinter } from "../../src/index.js";

describe.each(["metadata", "content"] as const)("createLinter cache (%s)", (cacheStrategy) => {
    let markdownPlugin: TextlintPluginCreator;
    let directory: string;
    let filePath: string;

    beforeAll(async () => {
        markdownPlugin = (await import("@textlint/textlint-plugin-markdown")).default;
    });

    beforeEach(async () => {
        directory = await fs.mkdtemp(path.join(os.tmpdir(), "textlint-rule-cache-"));
        filePath = path.join(directory, "test.md");
        await fs.writeFile(filePath, "hello\n");
    });

    afterEach(async () => {
        await fs.rm(directory, { recursive: true, force: true });
    });

    const createCachedLinter = (rule: TextlintRuleModule, options: boolean | object | undefined) => {
        return createLinter({
            cwd: directory,
            cache: true,
            cacheStrategy,
            cacheLocation: path.join(directory, ".textlintcache"),
            descriptor: new TextlintKernelDescriptor({
                rules: [{ ruleId: "test-rule", rule, options }],
                filterRules: [],
                plugins: [{ pluginId: "markdown", plugin: markdownPlugin }]
            })
        });
    };

    it.each([true, undefined, {}])(
        "invalidates a clean result when a disabled rule is enabled with %j",
        async (options) => {
            const rule: TextlintRuleReporter = (context) => ({
                [context.Syntax.Str](node) {
                    context.report(node, new context.RuleError("enabled rule ran"));
                }
            });
            const disabledResults = await createCachedLinter(rule, false).lintFiles([filePath]);
            assert.strictEqual(disabledResults[0].messages.length, 0);

            const enabledResults = await createCachedLinter(rule, options).lintFiles([filePath]);
            assert.strictEqual(enabledResults[0].messages.length, 1);
            assert.strictEqual(enabledResults[0].messages[0].message, "enabled rule ran");
        }
    );

    it("invalidates a clean result when a disabled fixer is enabled", async () => {
        const reporter: TextlintRuleReporter = (context) => ({
            [context.Syntax.Str](node) {
                if (node.raw === "hello") {
                    context.report(
                        node,
                        new context.RuleError("replace hello", {
                            fix: context.fixer.replaceText(node, "fixed")
                        })
                    );
                }
            }
        });
        const rule = { linter: reporter, fixer: reporter };
        await createCachedLinter(rule, false).fixFiles([filePath]);

        const results = await createCachedLinter(rule, true).fixFiles([filePath]);
        assert.strictEqual(results[0].output, "fixed\n");
    });

    it("reuses clean results when the enabled rules have not changed", async () => {
        let calls = 0;
        const rule: TextlintRuleReporter = () => {
            calls++;
            return {};
        };
        await createCachedLinter(rule, true).lintFiles([filePath]);
        assert.strictEqual(calls, 1);
        await createCachedLinter(rule, true).lintFiles([filePath]);
        assert.strictEqual(calls, 1, "an unchanged clean file should still be cached");
    });
});
