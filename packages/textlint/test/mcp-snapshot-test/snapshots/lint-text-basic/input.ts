import type { SnapshotInputFactory } from "../../types.js";

/**
 * Basic text linting with no configuration
 */
const inputFactory: SnapshotInputFactory = (context) => {
    return {
        description: "Basic text linting with no configuration",
        request: {
            name: "lintText",
            arguments: {
                text: "# Simple Text\n\nThis is a simple text document.",
                stdinFilename: "test.md"
            }
        }
    };
};

export default inputFactory;
