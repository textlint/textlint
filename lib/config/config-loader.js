// LICENSE : MIT
"use strict";
var rc = require('rc-loader');
// DEFAULT CONFIG FILE NAME
var CONFIG_FILENAME = "textlint";
function load(configFilePath) {
    var config = configFilePath ? {config: configFilePath} : null;
    return rc(CONFIG_FILENAME, {}, config);
}
module.exports = load;