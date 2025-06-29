module.exports = {
    rules: {
        "c-sub1": require("../textlint-rule-c-sub1"),
        "c-sub2": require("../textlint-rule-c-sub2")
    },
    rulesConfig: {
        "c-sub1": true,
        "c-sub2": true
    }
};
