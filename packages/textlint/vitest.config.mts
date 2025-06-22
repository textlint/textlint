import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: [...configDefaults.include, "**/*-test.ts", "**/*.test.ts", "**/*.spec.ts"],
        passWithNoTests: true,
        testTimeout: 10_000,
        environment: "node"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    }
});
