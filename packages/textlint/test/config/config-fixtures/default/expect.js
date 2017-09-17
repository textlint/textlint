const path = require("path");
module.exports = {
    disabledRules: [],
    extensions: [],
    plugins: [],
    rulePaths: [],
    rules: [],
    filterRules: [],
    rulesConfig: {},
    filterRulesConfig: {},
    color: true,
    configFile: path.join(__dirname, ".textlintrc")
};
