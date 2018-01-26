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
    plugins: ["prettier"],
    extends: ["eslint:recommended", "prettier"],
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
        "no-mixed-spaces-and-tabs": "off",
        "prettier/prettier": ["error", require("./package.json").prettier]
    }
};
