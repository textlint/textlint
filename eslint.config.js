const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
    // Base configuration for all files
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2022,
                ...globals.mocha,
                globalThis: true
            }
        },
        ...js.configs.recommended,
        rules: {
            "no-console": "warn",
            "no-undef": "error",
            "no-unused-vars": "off",
            "no-var": "error",
            "object-shorthand": "error",
            "prefer-const": "error",
            "prefer-rest-params": "error",
            "prefer-spread": "error",
            "prefer-template": "error",
            semi: "error",
            "no-extra-semi": "off",
            "no-mixed-spaces-and-tabs": "off"
        }
    },
    // TypeScript configuration
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ["./tsconfig.base.json", "./packages/*/tsconfig.json"]
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            // Override specific TypeScript rules if needed
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-require-imports": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/no-unsafe-function-type": "warn"
        }
    },
    // Console allowed in CLI files
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
    },
    // Ignore patterns
    {
        ignores: [
            "**/lib/**",
            "**/module/**",
            "out/",
            "node_modules/**",
            "packages/textlint-scripts/examples/",
            "test/integration-test/",
            "website/",
            "dist/**",
            "build/**",
            "coverage/**",
            "*.min.js",
            ".nx/**",
            "**/.nx/**"
        ]
    },
    // Prettier configuration (must be last)
    prettierConfig
];
