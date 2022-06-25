import { TextlintKernelOptions } from "../../../src/textlint-kernel-interface";
import rule from "./index";
import { createPluginStub } from "../../helper/ExamplePlugin";
import * as path from "path";

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
