// LICENSE : MIT
"use strict";
import { parse } from "@textlint/markdown-to-ast";
import * as path from "path";
import { TextlintSourceCodeImpl } from "../../src/context/TextlintSourceCodeImpl";

const testPath = path.join(__dirname, "fixtures", "test.md");
const dummyCode = `dummyCode`;
export default function createDummySourceCode(code = dummyCode, filePath = testPath) {
    return new TextlintSourceCodeImpl({
        code,
        ast: parse(code),
        ext: path.extname(filePath),
        filePath
    });
}
