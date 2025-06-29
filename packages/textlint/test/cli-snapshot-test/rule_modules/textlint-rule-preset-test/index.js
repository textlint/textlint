module.exports = {
    rules: {
        "rule-with-error": require("../textlint-rule-a"), // reuse existing rule
        "rule-with-warning": require("../textlint-rule-b") // reuse existing rule
    },
    rulesConfig: {
        "rule-with-error": {
            severity: "error",
            presetOption: "errorDefault"
        },
        "rule-with-warning": {
            severity: "warning",
            presetOption: "warningDefault"
        }
    }
};
