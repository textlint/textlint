// LICENSE : MIT
"use strict";
module.exports = {
    rules: {
        available: require("./rules/available-rule"),
        disable: require("./rules/disable-rule")
    },
    rulesConfig: {
        available: true,
        disable: false
    }
};
