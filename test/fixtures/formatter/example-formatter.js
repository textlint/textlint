// LICENSE : MIT
"use strict";
module.exports = function (results) {
    return "example-formatter\n" +
        results.map(function (result) {
            return result.messages.map(function (message) {
                return "xxx";
            });
        }).join("\n");
};