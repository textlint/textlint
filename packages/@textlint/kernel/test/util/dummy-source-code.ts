// LICENSE : MIT
"use strict";
import { parse } from "@textlint/markdown-to-ast";
import * as path from "node:path";
import { TextlintSourceCodeImpl } from "../../src/context/TextlintSourceCodeImpl.js";

const testPath = path.join(__dirname, "fixtures", "test.md");
const dummyCode = `dummyCode`;
export default function createDummySourceCode(code = dummyCode, filePath = testPath) {
    return new TextlintSourceCodeImpl({
        text: code,
        ast: parse(code),
        ext: path.extname(filePath),
        filePath
    });
}
