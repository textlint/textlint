module.exports = {
    root: true,
    globals: {
        globalThis: true
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module"
    },
    env: {
        browser: true,
        es6: true,
        node: true,
        mocha: true
    },
    extends: ["eslint:recommended"],
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
    },
    overrides: [
        {
            files: ["*.ts"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ["./tsconfig.base.json", "./packages/*/tsconfig.json"]
            }
        }
    ]
};
