import { configDefaults, defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        include: [...configDefaults.include, "**/test/*.ts"],
        passWithNoTests: true,
        testTimeout: 10_000,
        bail: 1,
        environment: "node"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    }
});
