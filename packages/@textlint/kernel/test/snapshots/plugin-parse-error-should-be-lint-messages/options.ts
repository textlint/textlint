import { TextlintKernelOptions } from "../../../src/textlint-kernel-interface.js";
import rule from "./index.js";
import * as path from "node:path";
import { ThrowPlugin } from "./parse-error-plugin.js";

export const options: TextlintKernelOptions = {
    filePath: path.join(__dirname, "input.md"),
    ext: ".md",
    plugins: [{ pluginId: "markdown", plugin: ThrowPlugin }],
    rules: [
        {
            ruleId: "rule",
            rule
        }
    ]
};
