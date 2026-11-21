import { describe, it } from "vitest";
import assert from "node:assert";
import type { TextlintPluginCreator, TextlintRuleModule, TextlintRuleReporter } from "@textlint/types";
import type { AnyTxtNode } from "@textlint/ast-node-types";
import { TextlintKernel } from "../../src/textlint-kernel.js";

const TEXT = "ab";
/**
 * Document > Paragraph > (Str "a", Str "b")
 * The Paragraph has another node in `extra`, which is not in `children`
 */
const createAst = (): AnyTxtNode => {
    const loc = (start: number, end: number) => ({
        start: { line: 1, column: start },
        end: { line: 1, column: end }
    });
    const str = (value: string, start: number) => ({
        type: "Str",
        value,
        raw: value,
        range: [start, start + 1],
        loc: loc(start, start + 1)
    });
    return {
        type: "Document",
        raw: TEXT,
        range: [0, 2],
        loc: loc(0, 2),
        children: [
            {
                type: "Paragraph",
                raw: TEXT,
                range: [0, 2],
                loc: loc(0, 2),
                extra: { type: "Extra", raw: "", value: "", range: [0, 0], loc: loc(0, 0) },
                children: [str("a", 0), str("b", 1)]
            }
        ]
    } as unknown as AnyTxtNode;
};

const plugin: TextlintPluginCreator = {
    Processor: class {
        availableExtensions() {
            return [".test"];
        }

        processor() {
            return {
                preProcess: () => createAst(),
                postProcess: (messages: unknown[], filePath?: string) => ({ messages, filePath })
            };
        }
    }
} as unknown as TextlintPluginCreator;

const lint = (rules: { ruleId: string; rule: TextlintRuleModule }[]) => {
    return new TextlintKernel().lintText(TEXT, {
        ext: ".test",
        plugins: [{ pluginId: "test", plugin }],
        rules
    });
};

const describeNode = (node: AnyTxtNode) => {
    return node.type === "Str" ? `Str(${node.value})` : node.type;
};

describe("traversal of the AST", () => {
    it("should call the listeners in depth-first order, with `:exit` after the children", async () => {
        const events: string[] = [];
        const record =
            (event: string) =>
            (node: AnyTxtNode): void => {
                events.push(`${event} ${describeNode(node)}`);
            };
        const rule: TextlintRuleReporter = () => ({
            Document: record("enter"),
            "Document:exit": record("exit"),
            Paragraph: record("enter"),
            "Paragraph:exit": record("exit"),
            Str: record("enter"),
            "Str:exit": record("exit"),
            Extra: record("enter"),
            "Extra:exit": record("exit")
        });
        await lint([{ ruleId: "record", rule }]);
        assert.deepStrictEqual(events, [
            "enter Document",
            "enter Paragraph",
            "enter Extra",
            "exit Extra",
            "enter Str(a)",
            "exit Str(a)",
            "enter Str(b)",
            "exit Str(b)",
            "exit Paragraph",
            "exit Document"
        ]);
    });

    it("should not visit a node in an inherited property", async () => {
        const visited: string[] = [];
        const inherited = { type: "Inherited", raw: "", value: "", range: [0, 0], loc: createAst().loc };
        const plugin: TextlintPluginCreator = {
            Processor: class {
                availableExtensions() {
                    return [".test"];
                }

                processor() {
                    return {
                        // the root node has the own properties of the AST, and inherits `inherited`
                        preProcess: () => {
                            const prototype = { inherited };
                            // an inherited getter is not called
                            Object.defineProperty(prototype, "inheritedGetter", {
                                enumerable: true,
                                get() {
                                    throw new Error("inheritedGetter is called");
                                }
                            });
                            return Object.assign(Object.create(prototype), createAst());
                        },
                        postProcess: (messages: unknown[], filePath?: string) => ({ messages, filePath })
                    };
                }
            }
        } as unknown as TextlintPluginCreator;
        const rule: TextlintRuleReporter = () => ({
            Document(node) {
                visited.push(node.type);
            },
            Paragraph(node) {
                visited.push(node.type);
            },
            Inherited(node) {
                visited.push(node.type);
            }
        });
        await new TextlintKernel().lintText(TEXT, {
            ext: ".test",
            plugins: [{ pluginId: "test", plugin }],
            rules: [{ ruleId: "visited", rule }]
        });
        assert.deepStrictEqual(visited, ["Document", "Paragraph"]);
    });

    it("should set the parent of each node, and `null` to the parent of the root node", async () => {
        const parents: string[] = [];
        const rule: TextlintRuleReporter = () => ({
            Document(node) {
                parents.push(`Document < ${node.parent === null ? "null" : typeof node.parent}`);
            },
            Paragraph(node) {
                parents.push(`Paragraph < ${node.parent?.type}`);
            },
            Str(node) {
                parents.push(`Str(${node.value}) < ${node.parent?.type}`);
            },
            Extra(node) {
                parents.push(`Extra < ${node.parent?.type}`);
                // `parent` is not enumerable
                assert.ok(!Object.keys(node).includes("parent"));
            }
        });
        await lint([{ ruleId: "parents", rule }]);
        assert.deepStrictEqual(parents, [
            "Document < null",
            "Paragraph < Document",
            "Extra < Paragraph",
            "Str(a) < Paragraph",
            "Str(b) < Paragraph"
        ]);
    });

    it("should call the listeners of the rules in the order of the rules, and a listener once for a node", async () => {
        const calls: string[] = [];
        const shared = (node: AnyTxtNode) => {
            calls.push(`shared ${describeNode(node)}`);
        };
        const first: TextlintRuleReporter = () => ({
            Str(node) {
                calls.push(`first ${describeNode(node)}`);
            }
        });
        const second: TextlintRuleReporter = () => ({
            Str(node) {
                calls.push(`second ${describeNode(node)}`);
            }
        });
        // two rules return the same function for the same node type
        const sharedRule: TextlintRuleReporter = () => ({ Str: shared });
        await lint([
            { ruleId: "first", rule: first },
            { ruleId: "shared-1", rule: sharedRule },
            { ruleId: "second", rule: second },
            { ruleId: "shared-2", rule: sharedRule }
        ]);
        assert.deepStrictEqual(calls, [
            "first Str(a)",
            "shared Str(a)",
            "second Str(a)",
            "first Str(b)",
            "shared Str(b)",
            "second Str(b)"
        ]);
    });

    it("should wait for the promises that the listeners return", async () => {
        const rule: TextlintRuleReporter = (context) => ({
            async Str(node) {
                await new Promise((resolve) => setTimeout(resolve, 10));
                context.report(node, new context.RuleError(`async ${node.value}`));
            },
            Paragraph(node) {
                context.report(node, new context.RuleError("sync"));
            }
        });
        const result = await lint([{ ruleId: "async", rule }]);
        assert.deepStrictEqual(result.messages.map((message) => message.message).sort(), [
            "async a",
            "async b",
            "sync"
        ]);
    });

    it("should reject when a listener returns a rejected promise", async () => {
        const rule: TextlintRuleReporter = () => ({
            async Str() {
                throw new Error("rejected in Str");
            }
        });
        await assert.rejects(lint([{ ruleId: "reject", rule }]), /rejected in Str/);
    });
});
