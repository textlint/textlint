import { configDefaults, defineConfig } from "vitest/config";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = dirname(fileURLToPath(import.meta.url));

// Alias all workspace @textlint/* packages to their src entrypoints so that
// vitest resolves imports without requiring a prior `pnpm run build`.
// This only affects vitest; other runners (mocha/textlint-tester) still rely
// on the built `lib/` via the package's `exports`/`main` fields.
const textlintPackagesDir = resolve(rootDir, "packages/@textlint");
const workspaceAliases = Object.fromEntries(
    readdirSync(textlintPackagesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => [
            `@textlint/${entry.name}`,
            resolve(textlintPackagesDir, entry.name, "src/index.ts")
        ])
);

export default defineConfig({
    test: {
        include: [...configDefaults.include, "**/*.test.ts", "**/*.spec.ts"],
        passWithNoTests: true,
        testTimeout: 10_000,
        environment: "node"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
        alias: workspaceAliases
    }
});
