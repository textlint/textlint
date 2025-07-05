import type { SnapshotInputFactory } from "../../types.js";

/**
 * Error case: lintText with unsupported file extension
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Error case: lintText with unsupported file extension",
        request: {
            name: "lintText",
            arguments: {
                text: "This is content with unsupported extension",
                stdinFilename: "test.xyz"
            }
        }
    };
};

export default inputFactory;
