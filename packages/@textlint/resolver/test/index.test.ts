import * as assert from "node:assert";
import { afterEach, beforeEach } from "mocha";
import {
    registerResolveHook,
    registerImportHook,
    dynamicImport,
    ResolverContext,
    tryResolve,
    clearHooks,
} from "../src/index";

describe("@secretlint/resolver", () => {
    const myModuleURL = "file:///path/to/my-module.js";
    beforeEach(() => {
        // Define a resolve hook
        const myResolveHook = (specifier: string, _context: ResolverContext) => {
            if (specifier === "my-module") {
                return { url: "file:///path/to/my-module.js" };
            }
            return undefined;
        };

        // Define an import hook
        const myImportHook = async (specifier: string, _context: ResolverContext) => {
            if (specifier === "my-module") {
                return { exports: { default: "My Module" } };
            }
            return undefined;
        };

        // Register the hooks
        registerResolveHook(myResolveHook);
        registerImportHook(myImportHook);
    });
    afterEach(() => {
        clearHooks();
    });

    describe("tryResolve", () => {
        it("should resolve my-module correctly", () => {
            const result = tryResolve("my-module", {
                parentModule: "linter-formatter",
            });
            assert.strictEqual(result, myModuleURL);
        });
        it("should not resolve other-module", () => {
            const result = tryResolve("other-module", {
                parentModule: "linter-formatter",
            });
            assert.ok(!result);
        });
    });
    describe("dynamicImport", () => {
        it("should resolve and import my-module correctly", async () => {
            const result = await dynamicImport("my-module", {
                parentModule: "linter-formatter",
            });
            assert.ok(result.exports);
            assert.strictEqual(result.exports.default, "My Module");
        });
        it("should not resolve and import other-module", async () => {
            await assert.rejects(async () => {
                await dynamicImport("other-module", {
                    parentModule: "linter-formatter",
                });
            });
        });
    });
});
