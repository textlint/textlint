// LICENSE : MIT
"use strict";
import configurableRule from "./rules/configurable-rule.js";

export default {
    rules: {
        "configurable-rule": configurableRule,
        "overwrited-rule": configurableRule
    },
    rulesConfig: {
        "configurable-rule": {
            "option-key": "42"
        },
        "overwrited-rule": true
    }
};
