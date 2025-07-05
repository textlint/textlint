import type { SnapshotInputFactory } from "../../types.js";

/**
 * Error case: getLintFixedFileContent with non-existent file
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Error case: getLintFixedFileContent with non-existent file",
        request: {
            name: "getLintFixedFileContent",
            arguments: {
                filePaths: ["./missing-file-to-fix.md"]
            }
        }
    };
};

export default inputFactory;
