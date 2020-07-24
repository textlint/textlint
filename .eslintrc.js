module.exports = {
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: "module"
    },
    env: {
        browser: true,
        es6: true,
        node: true,
        mocha: true
    },
    extends: ["eslint:recommended", "plugin:prettier/recommended"],
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
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ["./tsconfig.base.json", "./packages/*/tsconfig.json"]
            },
            extends: [
                // "plugin:@typescript-eslint/recommended",
                // "plugin:@typescript-eslint/recommended-requiring-type-checking",
                "prettier/@typescript-eslint"
            ]
        }
    ]
};
