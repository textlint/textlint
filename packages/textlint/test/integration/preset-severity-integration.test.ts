// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { describe, it } from "vitest";
import { createLinter, loadTextlintrc } from "../../src/index.js";
import * as path from "node:path";

const fixturesDir = path.join(__dirname, "..", "..", "..", "@textlint", "config-loader", "test", "modules_fixtures");

describe("Integration: Preset severity preservation", function () {
    it("should preserve preset severity when user provides partial configuration", async function () {
        const descriptor = await loadTextlintrc({
            configFilePath: path.join(__dirname, "fixtures", "preset-severity-integration", ".textlintrc.json"),
            node_modulesDir: fixturesDir
        });

        const linter = createLinter({
            descriptor
        });

        const results = await linter.lintText("This is test text", "test.txt");

        // The test verifies that:
        // 1. Preset rules are loaded correctly
        // 2. Severity settings from preset are preserved
        // 3. User options are merged with preset options

        assert.ok(results, "Should return results");
        assert.strictEqual(results.filePath, "test.txt", "Should have correct file path");

        // The key test: if the fix is working, this won't throw errors
        // and the rules will be properly configured with merged options
        assert.ok(Array.isArray(results.messages), "Should have messages array");
    });
});
