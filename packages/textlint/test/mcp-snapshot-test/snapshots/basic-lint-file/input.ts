import type { SnapshotInputFactory } from "../../types.js";

/**
 * Basic file linting with no errors
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Basic file linting with no errors",
        request: {
            name: "lintFile",
            arguments: {
                filePaths: ["test-file.md"]
            }
        }
    };
};

export default inputFactory;
