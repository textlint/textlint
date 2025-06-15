// LICENSE : MIT
"use strict";
import a from "./rules/textlint-rule-a.js";
import b from "./rules/textlint-rule-b.js";

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
