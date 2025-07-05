import type { SnapshotInputFactory } from "../../types.js";

/**
 * Error case: lintFile with non-existent file
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Error case: lintFile with non-existent file",
        request: {
            name: "lintFile",
            arguments: {
                filePaths: ["./non-existent-file.md", "./another-missing-file.txt"]
            }
        }
    };
};

export default inputFactory;
