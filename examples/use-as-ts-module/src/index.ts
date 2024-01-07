// LICENSE : MIT
import { createLinter, loadTextlintrc, loadLinterFormatter } from "textlint";
import path from "node:path";
import { parseArgs } from "node:util";

async function lintFile(filePaths: string[]) {
    // descriptor is a structure object for linter
    // It includes rules, plugins, and options
    const descriptor = await loadTextlintrc({
        configFilePath: path.join(process.cwd(), ".textlintrc.json")
    });
    const linter = createLinter({
        descriptor
    });
    const results = await linter.lintFiles(filePaths);
    // textlint has two types formatter sets for linter and fixer
    const formatter = await loadLinterFormatter({ formatterName: "stylish" });
    const output = formatter.format(results);
    console.log(output);
}

const { positionals } = parseArgs({
    allowPositionals: true
});
lintFile(positionals).catch(function (error) {
    console.error(error);
    process.exit(1);
});
