// LICENSE : MIT
"use strict";
module.exports = {
    rules: {
        "a": require("./rules/textlint-rule-a"),
        "b": require("./rules/textlint-rule-b")
    },
    rulesConfig: {
        "a": true,
        "b": true
    }
};
