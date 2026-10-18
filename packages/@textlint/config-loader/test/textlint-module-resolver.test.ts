import * as assert from "node:assert";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { afterEach, describe, it } from "vitest";
import { clearHooks, registerResolveHook } from "@textlint/resolver";
import { TextLintModuleResolver } from "../src/textlint-module-resolver.js";

describe("TextLintModuleResolver", () => {
    let directory: string | undefined;
    afterEach(() => {
        clearHooks();
        if (directory) {
            rmSync(directory, { recursive: true, force: true });
            directory = undefined;
        }
    });

    it.each([
        ["resolveRulePackageName", "@scope/example", "textlint-rule-example"],
        ["resolveRulePackageName", "@scope/textlint-rule-example", "textlint-rule-example"],
        ["resolveFilterRulePackageName", "@scope/example", "textlint-filter-rule-example"],
        ["resolveFilterRulePackageName", "@scope/textlint-filter-rule-example", "textlint-filter-rule-example"],
        ["resolvePluginPackageName", "@scope/example", "textlint-plugin-example"],
        ["resolvePluginPackageName", "@scope/textlint-plugin-example", "textlint-plugin-example"],
        ["resolvePresetPackageName", "@scope/preset-example", "textlint-rule-preset-example"],
        ["resolvePresetPackageName", "@scope/textlint-rule-preset-example", "textlint-rule-preset-example"],
        ["resolveConfigPackageName", "@scope/example", "textlint-config-example"],
        ["resolveConfigPackageName", "@scope/textlint-config-example", "textlint-config-example"]
    ] as const)("%s resolves %s with exports without a base directory", (method, specifier, packageName) => {
        directory = mkdtempSync(path.join(tmpdir(), "textlint-scoped-"));
        const packageDirectory = path.join(directory, "node_modules", "@scope", packageName);
        mkdirSync(packageDirectory, { recursive: true });
        writeFileSync(path.join(packageDirectory, "package.json"), JSON.stringify({ exports: "./index.cjs" }));
        writeFileSync(path.join(packageDirectory, "index.cjs"), "module.exports = {};\n");
        const requireFromFixture = createRequire(path.join(directory, "fixture.cjs"));
        registerResolveHook((specifier) => ({ url: requireFromFixture.resolve(specifier) }));
        const resolver = new TextLintModuleResolver({});
        const expected = path.join(packageDirectory, "index.cjs");

        const result = resolver[method](specifier);

        assert.strictEqual(typeof result === "string" ? result : result.filePath, expected);
    });

    it.each(["a", "@scope/a"])("resolves %s from an explicit base directory", (specifier) => {
        const baseDirectory = path.join(__dirname, "modules_fixtures");
        const resolver = new TextLintModuleResolver({ rulesBaseDirectory: baseDirectory });
        const expected = path.join(baseDirectory, specifier === "a" ? "" : "@scope", "textlint-rule-a", "index.js");

        const result = resolver.resolveRulePackageName(specifier);

        assert.strictEqual(result.filePath, expected);
    });
});
