import type { SnapshotInputFactory } from "../../types.js";

/**
 * Error case: lintText with empty stdinFilename
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Error case: lintText with empty stdinFilename",
        request: {
            name: "lintText",
            arguments: {
                text: "This is test content",
                stdinFilename: "   " // Only whitespace
            }
        }
    };
};

export default inputFactory;
