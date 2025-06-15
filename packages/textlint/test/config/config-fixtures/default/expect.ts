import path from "node:path";

export default {
    disabledRules: [],
    plugins: [],
    rulePaths: [],
    rules: [],
    filterRules: [],
    rulesConfig: {},
    filterRulesConfig: {},
    color: true,
    configFile: path.join(__dirname, ".textlintrc")
};
