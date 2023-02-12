module.exports = {
    rules: {
        a: require("../textlint-rule-a"),
        b: require("../textlint-rule-b"),
        c: require("../textlint-rule-c")
    },
    rulesConfig: {
        a: true,
        b: true,
        c: true
    }
};
