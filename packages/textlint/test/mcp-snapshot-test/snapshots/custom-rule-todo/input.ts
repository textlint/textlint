import type { SnapshotInputFactory } from "../../types.js";

/**
 * Custom rule that detects TODO items
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Custom rule that detects TODO items",
        serverOptions: {
            configFilePath: "textlintrc.json",
            node_modulesDir: context.ruleModulesDir
        },
        request: {
            name: "lintFile",
            arguments: {
                filePaths: ["todo-file.md"]
            }
        }
    };
};

export default inputFactory;
