// LICENSE : MIT
"use strict";
import a from "./rules/textlint-rule-a";
import b from "./rules/textlint-rule-b";

export default {
    rules: {
        a,
        b
    },
    rulesConfig: {
        a: true,
        b: true
    }
};
