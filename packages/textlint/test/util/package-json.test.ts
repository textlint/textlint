import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "vitest";
import { getTextlintVersion, readClosestPackageJson } from "../../src/util/package-json.js";

describe("package-json", () => {
    let tmpDir: string;
    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-package-json-"));
    });
    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    describe("readClosestPackageJson", () => {
        it("should read package.json in a parent directory", () => {
            fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "root", version: "1.0.0" }));
            const nestedDir = path.join(tmpDir, "a", "b");
            fs.mkdirSync(nestedDir, { recursive: true });
            assert.deepStrictEqual(readClosestPackageJson(nestedDir), { name: "root", version: "1.0.0" });
        });
        it("should prefer the closest package.json", () => {
            fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "root" }));
            const nestedDir = path.join(tmpDir, "nested");
            fs.mkdirSync(nestedDir);
            fs.writeFileSync(path.join(nestedDir, "package.json"), JSON.stringify({ name: "nested" }));
            assert.deepStrictEqual(readClosestPackageJson(nestedDir), { name: "nested" });
        });
        it("should skip a directory named package.json", () => {
            fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "root" }));
            const nestedDir = path.join(tmpDir, "nested");
            fs.mkdirSync(path.join(nestedDir, "package.json"), { recursive: true });
            assert.deepStrictEqual(readClosestPackageJson(nestedDir), { name: "root" });
        });
        it("should throw if the closest package.json is invalid", () => {
            fs.writeFileSync(path.join(tmpDir, "package.json"), "{");
            assert.throws(() => readClosestPackageJson(tmpDir));
        });
    });
    describe("getTextlintVersion", () => {
        it("should return the version of textlint", () => {
            const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8"));
            assert.strictEqual(getTextlintVersion(), pkg.version);
        });
    });
});
