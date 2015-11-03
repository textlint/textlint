// LICENSE : MIT
"use strict";
export default {
    rules: {
        "configurable-rule": require("./rules/configurable-rule"),
        "overwrited-rule": require("./rules/configurable-rule")
    },
    rulesConfig: {
        "configurable-rule": {
            "option-key": "42"
        },
        "overwrited-rule": true
    }
};
