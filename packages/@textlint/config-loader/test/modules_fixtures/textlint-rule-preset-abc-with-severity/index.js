module.exports = {
    rules: {
        a: require("../textlint-rule-a"),
        b: require("../textlint-rule-b"),
        c1: require("../textlint-rule-c-sub1"),
        c2: require("../textlint-rule-c-sub2")
    },
    rulesConfig: {
        a: { severity: "warning", presetOption: "default" },
        b: { severity: "warning", anotherPresetOption: "value" },
        c1: { severity: "warning" },
        c2: { severity: "warning" }
    }
};
