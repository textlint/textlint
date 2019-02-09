const path = require("path");
module.exports = {
    rules: [],
    presets: ["@textlint/foo"],
    rulesConfig: {
        "@textlint/foo/a": true
    },
    configFile: path.join(__dirname, ".textlintrc")
};
