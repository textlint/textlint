const path = require("path");
module.exports = {
    rules: [],
    presets: ["@textlint/preset-foo"],
    rulesConfig: {
        "@textlint/preset-foo/a": true
    },
    configFile: path.join(__dirname, ".textlintrc")
};
