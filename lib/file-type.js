// LICENSE : MIT
"use strict";
var path = require("path");
function isMarkdown(filePath) {
    var extname = path.extname(filePath).toLowerCase();
    if (extname === ".md" || extname === ".mdown" || extname === ".markdown" || extname === ".mkd" || extname === ".mkdn") {
        return true;
    }
}
module.exports = {
    isMarkdown: isMarkdown
};