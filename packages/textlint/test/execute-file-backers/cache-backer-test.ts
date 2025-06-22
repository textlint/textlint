// MIT © 2016 azu
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import path from "node:path";
import os from "node:os";
import sh from "shelljs";
import fs from "node:fs";
import { CacheBacker, CacheBackerOptions } from "../../src/engine/execute-file-backers/cache-backer.js";
import { TextlintMessage } from "@textlint/types";

describe("CacheBacker", function () {
    let configDir: string;
    before(function () {
        configDir = path.join(os.tmpdir(), "textlint-config");
        sh.mkdir("-p", configDir);
    });
    after(function () {
        sh.rm("-r", configDir);
    });
    describe("when previously have success result", function () {
        it("shouldExecute return false", () => {
            const config: CacheBackerOptions = {
                cache: true,
                cacheLocation: path.resolve(configDir, ".cache"),
                hash: "test-hash"
            };
            const cacheBacker = new CacheBacker(config);
            const prevResult = { filePath: path.join(__dirname, "fixtures/test.md"), messages: [] };
            // prev
            cacheBacker.didExecute({ result: prevResult });
            cacheBacker.afterAll();
            // next
            const shouldExecute = cacheBacker.shouldExecute({ filePath: prevResult.filePath });
            assert.ok(shouldExecute === false);
        });
    });

    describe("when previously have failure result", function () {
        it("shouldExecute return true", () => {
            const config: CacheBackerOptions = {
                cache: true,
                cacheLocation: path.resolve(configDir, ".cache"),
                hash: "test-hash"
            };
            const cacheBacker = new CacheBacker(config);
            const prevResult = {
                filePath: path.join(__dirname, "fixtures/test.md"),
                messages: [{} as TextlintMessage, {} as TextlintMessage]
            };
            // prevTextlintMessage
            cacheBacker.didExecute({ result: prevResult });
            cacheBacker.afterAll();
            // next
            const shouldExecute = cacheBacker.shouldExecute({ filePath: prevResult.filePath });
            assert.ok(shouldExecute);
        });
    });
    describe("when specify `cacheLocation` options", function () {
        it("should save the specific path", () => {
            const cacheFilePath = path.resolve(configDir, ".cache");
            const config: CacheBackerOptions = {
                cache: true,
                cacheLocation: cacheFilePath,
                hash: "test-hash"
            };
            const cacheBacker = new CacheBacker(config);
            const filePath = path.join(__dirname, "fixtures/test.md");
            const prevResult = {
                filePath,
                messages: [{} as TextlintMessage, {} as TextlintMessage]
            }; // has errors
            // prev
            cacheBacker.didExecute({ result: prevResult });
            cacheBacker.afterAll();
            assert.ok(fs.existsSync(cacheFilePath));
        });
    });
});
