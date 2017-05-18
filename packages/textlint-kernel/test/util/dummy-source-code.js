// LICENSE : MIT
"use strict";
import {parse} from "markdown-to-ast";
import * as path from "path";
import * as fs from "fs";
import SourceCode from "../../src/core/source-code";
const testPath = path.join(__dirname, "fixtures", "test.md");
const dummyCode = fs.readFileSync(testPath, "utf-8");
export default function createDummySourceCode(code = dummyCode, filePath = testPath) {
    return new SourceCode({
        code,
        ast: parse(code),
        ext: path.extname(filePath),
        filePath
    });
}
