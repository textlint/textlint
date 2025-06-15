import path from "node:path";

export default {
    rules: [],
    presets: ["@textlint/foo"],
    rulesConfig: {
        "@textlint/foo/a": true
    },
    configFile: path.join(__dirname, ".textlintrc")
};
