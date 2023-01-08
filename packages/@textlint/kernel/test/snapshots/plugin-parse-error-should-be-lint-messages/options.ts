import { TextlintKernelOptions } from "../../../src/textlint-kernel-interface";
import rule from "./index";
import * as path from "path";
import { ThrowPlugin } from "./parse-error-plugin";

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
