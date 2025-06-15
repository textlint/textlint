import { TextlintKernelOptions } from "../../../src/textlint-kernel-interface.js";
import rule from "./index.js";
import { createPluginStub } from "../../helper/ExamplePlugin.js";
import * as path from "node:path";

const { plugin } = createPluginStub({
    extensions: [".md"]
});

export const options: TextlintKernelOptions = {
    filePath: path.join(__dirname, "input.md"),
    ext: ".md",
    plugins: [{ pluginId: "markdown", plugin: plugin }],
    rules: [
        {
            ruleId: "rule",
            rule: rule
        }
    ]
};
