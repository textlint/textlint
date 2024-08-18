// LICENSE : MIT
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const confirmer = require("confirmer");
const process = require("node:process");
const templatePath = path.resolve(__dirname, "..", "configs", "README.md.template");
//  textlint-scripts init --yes
const isYES = process.argv.includes("--yes");
async function init() {
    const outputFilePath = path.join(process.cwd(), "README.md");
    if (fs.existsSync(outputFilePath)) {
        return;
    }
    const result = isYES ? true : confirmer("Would you overwrite README.md? (y/n)");
    if (!result) {
        throw new Error("Not overwrite README.md");
    }
    const { pkg2readme } = await import("pkg-to-readme");
    await pkg2readme({
        template: templatePath,
        output: outputFilePath
    });
}

init()
    .then(function () {
        console.log("Generated README.md");
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
