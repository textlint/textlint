#!/usr/bin/env node
const { TextlintKernel } = require("@textlint/kernel");
const path = require("path");

// 簡単なプラグインの例を作成
const mockPlugin = {
    Processor: class MockProcessor {
        static availableExtensions() {
            return [".md"];
        }

        processor(text, filePath) {
            return {
                preProcess: () => ({
                    type: "Document",
                    children: [
                        {
                            type: "Str",
                            value: text,
                            range: [0, text.length]
                        }
                    ],
                    range: [0, text.length]
                }),
                postProcess: (messages) => messages
            };
        }
    }
};

// 簡単なルールの例を作成
const mockRule = (context) => {
    return {
        [context.Syntax.Str](node) {
            context.report(node, new context.RuleError("Test error"));
        }
    };
};

// テストケース1: プリセットルールにseverityを設定した場合
async function testPresetWithSeverity() {
    console.log("Testing preset with severity configuration...");

    const kernel = new TextlintKernel();

    // プリセットを使用し、プリセット内のルールにseverityを設定
    const options = {
        filePath: "test.md",
        ext: ".md",
        plugins: [
            {
                pluginId: "markdown",
                plugin: mockPlugin
            }
        ],
        rules: [
            // プリセットとして
            {
                ruleId: "preset-example/rule-a",
                rule: mockRule,
                options: { severity: "warning" }
            },
            {
                ruleId: "preset-example/rule-b",
                rule: mockRule,
                options: { severity: "error" }
            }
        ]
    };

    const result = await kernel.lintText("This is test text.", options);

    console.log("Messages found:", result.messages.length);
    result.messages.forEach((msg) => {
        console.log(`- Rule: ${msg.ruleId}, Severity: ${msg.severity}, Message: ${msg.message}`);
    });

    return result;
}

// テストケース2: 通常のルールでのseverity動作
async function testNormalRuleWithSeverity() {
    console.log("\nTesting normal rule with severity configuration...");

    const kernel = new TextlintKernel();

    const options = {
        filePath: "test.md",
        ext: ".md",
        plugins: [
            {
                pluginId: "markdown",
                plugin: mockPlugin
            }
        ],
        rules: [
            {
                ruleId: "normal-rule",
                rule: mockRule,
                options: { severity: "warning" }
            }
        ]
    };

    const result = await kernel.lintText("This is test text.", options);

    console.log("Messages found:", result.messages.length);
    result.messages.forEach((msg) => {
        console.log(`- Rule: ${msg.ruleId}, Severity: ${msg.severity}, Message: ${msg.message}`);
    });

    return result;
}

async function main() {
    try {
        console.log("Starting tests...");
        await testPresetWithSeverity();
        await testNormalRuleWithSeverity();
        console.log("Tests completed successfully");
    } catch (error) {
        console.error("Error:", error);
        console.error(error.stack);
    }
}

main();
