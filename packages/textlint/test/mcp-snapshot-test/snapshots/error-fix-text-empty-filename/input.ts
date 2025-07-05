import type { SnapshotInputFactory } from "../../types.js";

/**
 * Error case: getLintFixedTextContent with whitespace-only stdinFilename
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Error case: getLintFixedTextContent with whitespace-only stdinFilename",
        request: {
            name: "getLintFixedTextContent",
            arguments: {
                text: "Some text content to fix",
                stdinFilename: "   " // Only whitespace
            }
        }
    };
};

export default inputFactory;
