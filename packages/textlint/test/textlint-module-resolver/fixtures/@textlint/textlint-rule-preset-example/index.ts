// LICENSE : MIT
"use strict";
import a from "./rules/textlint-rule-a";
import b from "./rules/textlint-rule-b";

module.exports = {
    rules: {
        a,
        b
    },
    rulesConfig: {
        a: true,
        b: true
    }
};
