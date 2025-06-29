module.exports = {
    rules: {
        uniqueA: require("../textlint-rule-a"),
        uniqueB: require("../textlint-rule-b"),
        uniqueC: require("../textlint-rule-c-sub1")
    },
    rulesConfig: {
        uniqueA: true,
        uniqueB: true,
        uniqueC: true
    }
};
