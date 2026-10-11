import * as assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "vitest";
import { isTxtAST, test } from "../src/index.js";

const base = {
    raw: "",
    range: [0, 0],
    loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } }
};

function node(type: string, fields: Record<string, unknown> = {}): Record<string, unknown> {
    return { ...base, type, ...fields };
}

function invalidStrict(ast: Record<string, unknown>, field: string) {
    assert.throws(() => test(ast, { strict: true }), new RegExp(`\\b${ast.type}\\b.*\\b${field}\\b`, "s"));
    assert.strictEqual(isTxtAST(ast, { strict: true }), false);
}

describe("opt-in built-in TxtNode validation", () => {
    it("keeps the generic default contract, including explicit false and empty options", () => {
        const invalidHeader = node("Header", { depth: 99, children: [] });
        for (const options of [undefined, {}, { strict: false }]) {
            assert.doesNotThrow(() => test(invalidHeader, options));
            assert.strictEqual(isTxtAST(invalidHeader, options), true);
        }
        invalidStrict(invalidHeader, "depth");
    });

    it("allows unknown plugin types, synthetic exits and extra fields under strict", () => {
        for (const type of ["PluginWidget", "Str:exit", "DeprecatedNode"]) {
            const custom = node(type, { pluginSpecific: { arbitrary: true }, children: [] });
            assert.doesNotThrow(() => test(custom, { strict: true }));
            assert.strictEqual(isTxtAST(custom, { strict: true }), true);
        }
        assert.doesNotThrow(() => test(node("List", { children: [], loose: false }), { strict: true }));
        assert.doesNotThrow(() => test(node("ListItem", { children: [], loose: false }), { strict: true }));
    });

    it("propagates strict options through children of known and unknown parents", () => {
        const invalidChild = node("Header", { depth: 99, children: [] });
        for (const parentType of ["Document", "PluginWidget"]) {
            const tree = node(parentType, { children: [node("Str", { value: "ok" }), invalidChild] });
            assert.doesNotThrow(() => test(tree));
            assert.doesNotThrow(() => test(tree, { strict: false }));
            assert.throws(() => test(tree, { strict: true }), /Header.*depth/s);
            assert.strictEqual(isTxtAST(tree, { strict: true }), false);
        }
    });

    it("requires children for each concrete built-in parent type", () => {
        for (const type of [
            "Document",
            "Paragraph",
            "Header",
            "BlockQuote",
            "List",
            "ListItem",
            "Table",
            "TableRow",
            "TableCell",
            "Emphasis",
            "Strong",
            "Delete",
            "Link",
            "LinkReference"
        ]) {
            const fields =
                type === "Header"
                    ? { depth: 1 }
                    : type === "Link"
                    ? { url: "" }
                    : type === "LinkReference"
                    ? { identifier: "", label: "", referenceType: "full" }
                    : {};
            invalidStrict(node(type, fields), "children");
            invalidStrict(node(type, { ...fields, children: null }), "children");
            assert.doesNotThrow(() => test(node(type, fields)));
        }
    });

    it("requires value for each concrete built-in text node", () => {
        for (const type of ["Html", "Comment", "CodeBlock", "Str", "Code"]) {
            invalidStrict(node(type), "value");
            invalidStrict(node(type, { value: null }), "value");
            assert.doesNotThrow(() => test(node(type)));
            assert.doesNotThrow(() => test(node(type, { value: "" }), { strict: true }));
        }
    });

    it("requires Header depth 1 through 6 and does not mistake level for depth", () => {
        for (const depth of [undefined, null, 0, 7, 99, 1.5, "1", NaN]) {
            invalidStrict(node("Header", { children: [], depth }), "depth");
        }
        invalidStrict(node("Header", { children: [], level: 1 }), "depth");
        for (const depth of [1, 2, 3, 4, 5, 6]) {
            assert.doesNotThrow(() => test(node("Header", { depth, children: [] }), { strict: true }));
        }
    });

    it("requires resource and reference fields only for their declaring kinds", () => {
        for (const type of ["Link", "Image", "Definition"]) {
            const fields =
                type === "Link" ? { children: [] } : type === "Definition" ? { identifier: "", label: "" } : {};
            invalidStrict(node(type, fields), "url");
            invalidStrict(node(type, { ...fields, url: 123 }), "url");
            assert.doesNotThrow(() => test(node(type, { ...fields, url: "" }), { strict: true }));
        }
        for (const type of ["LinkReference", "ImageReference", "Definition"]) {
            const fields = type === "LinkReference" ? { children: [] } : type === "Definition" ? { url: "" } : {};
            for (const field of ["identifier", "label"]) {
                invalidStrict(node(type, { ...fields, [field === "identifier" ? "label" : "identifier"]: "" }), field);
            }
            const valid = { ...fields, identifier: "", label: "" };
            if (type !== "Definition") {
                invalidStrict(node(type, valid), "referenceType");
                for (const value of [null, 1, "other"]) {
                    invalidStrict(node(type, { ...valid, referenceType: value }), "referenceType");
                }
                for (const referenceType of ["shortcut", "collapsed", "full"]) {
                    assert.doesNotThrow(() => test(node(type, { ...valid, referenceType }), { strict: true }));
                }
            } else {
                assert.doesNotThrow(() => test(node(type, valid), { strict: true }));
            }
        }
    });

    it("validates optional declared fields only when non-nullish", () => {
        const cases: { type: string; required: Record<string, unknown>; field: string; bad: unknown; good: unknown }[] =
            [
                { type: "List", required: { children: [] }, field: "ordered", bad: "yes", good: false },
                { type: "List", required: { children: [] }, field: "start", bad: "1", good: 0 },
                { type: "List", required: { children: [] }, field: "spread", bad: 1, good: true },
                { type: "ListItem", required: { children: [] }, field: "checked", bad: "yes", good: false },
                { type: "ListItem", required: { children: [] }, field: "spread", bad: 1, good: true },
                { type: "CodeBlock", required: { value: "" }, field: "lang", bad: 5, good: "" },
                { type: "CodeBlock", required: { value: "" }, field: "meta", bad: false, good: "" },
                { type: "Link", required: { children: [], url: "" }, field: "title", bad: true, good: "" },
                { type: "Image", required: { url: "" }, field: "alt", bad: true, good: "" },
                { type: "Image", required: { url: "" }, field: "title", bad: true, good: "" },
                {
                    type: "ImageReference",
                    required: { identifier: "", label: "", referenceType: "full" },
                    field: "alt",
                    bad: true,
                    good: ""
                },
                {
                    type: "Definition",
                    required: { url: "", identifier: "", label: "" },
                    field: "title",
                    bad: true,
                    good: ""
                },
                {
                    type: "Table",
                    required: { children: [] },
                    field: "align",
                    bad: ["left", "bad"],
                    good: ["left", null, "center", "right"]
                }
            ];
        for (const { type, required, field, bad, good } of cases) {
            invalidStrict(node(type, { ...required, [field]: bad }), field);
            for (const value of [undefined, null, good]) {
                assert.doesNotThrow(() => test(node(type, { ...required, [field]: value }), { strict: true }));
            }
        }
        invalidStrict(node("Table", { children: [], align: "left" }), "align");
    });

    it("accepts all declared leaf kinds without invented children/value rules", () => {
        for (const type of ["HorizontalRule", "Break"]) {
            assert.doesNotThrow(() => test(node(type), { strict: true }));
            assert.doesNotThrow(() => test(node(type, { value: "extra", children: [] }), { strict: true }));
        }
    });

    it("accepts both real AST fixtures in strict mode", () => {
        for (const file of ["markdown-to-ast.json", "text-to-ast.json"]) {
            const ast = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", file), "utf-8"));
            assert.doesNotThrow(() => test(ast, { strict: true }));
            assert.strictEqual(isTxtAST(ast, { strict: true }), true);
        }
    });
});
