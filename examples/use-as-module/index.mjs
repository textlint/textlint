// LICENSE : MIT
import { createLinter, loadTextlintrc, loadLinterFormatter } from "textlint";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function lintFile(filePath) {
    // descriptor is a structure object for linter
    // It includes rules, plugins, and options
    const descriptor = await loadTextlintrc({
        configFilePath: path.join(__dirname, ".textlintrc.json")
    });
    const linter = createLinter({
        descriptor
    });
    const scanResult = await linter.scanFilePath(filePath);
    console.log(scanResult); // { status: "ok" }
    
    const results = await linter.lintFiles([filePath]);
    // textlint has two types formatter sets for linter and fixer
    const formatter = await loadLinterFormatter({ formatterName: "stylish" });
    const output = formatter.format(results);
    console.log(output);
}

lintFile(`${__dirname  }/README.md`).catch(function(error) {
    console.error(error);
    process.exit(1);
});
