import { configDefaults, defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        include: [...configDefaults.include, "**/test/*.ts"],
        passWithNoTests: true,
        testTimeout: 10_000,
        bail: 1,
        environment: "node"
    },
    esbuild: {
        target: "node14"
    },
    resolve: {
        extensions: [".ts", ".js", ".json"]
    }
});
