// LICENSE : MIT
"use strict";
module.exports = function (results) {
    return "example-fixer-formatter\n" +
        results.map(function (result) {
            return result.applyingMessages.map(function (message) {
                return "xxx";
            });
        }).join("\n");
};
