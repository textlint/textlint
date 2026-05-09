import tseslint from "typescript-eslint";

const commonRules = {
    "no-console": "warn",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "error"
};

export default tseslint.config(
    {
        ignores: [
            "**/lib/**",
            "**/module/**",
            "out/**",
            "node_modules/**",
            "packages/textlint-scripts/examples/**",
            "test/integration-test/**",
            "dist/**",
            "build/**",
            "coverage/**",
            "**/*.min.js"
        ]
    },
    {
        files: ["**/*.{js,jsx,mjs,cjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        rules: commonRules
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin
        },
        rules: {
            ...commonRules,
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-empty-object-type": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@typescript-eslint/no-unsafe-function-type": "error",
            "@typescript-eslint/no-require-imports": "off"
        }
    },
    {
        files: ["**/*.ts"],
        rules: {
            "@typescript-eslint/no-require-imports": "error"
        }
    },
    {
        files: [
            "**/bin/**",
            "**/scripts/**",
            "examples/**",
            "**/debug-*.{js,mjs,ts}",
            "**/tools/**",
            "**/*.test.ts"
        ],
        rules: {
            "no-console": "off"
        }
    }
);
