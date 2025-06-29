module.exports = {
    rules: {
        a: require("../textlint-rule-a"),
        b: require("../textlint-rule-b"),
        c: require("../textlint-rule-c-sub1")
    },
    rulesConfig: {
        a: { severity: "warning", presetOption: "default" },
        b: { severity: "warning", anotherPresetOption: "value" },
        c: { severity: "warning", anotherPresetOption: "value" }
    }
};
