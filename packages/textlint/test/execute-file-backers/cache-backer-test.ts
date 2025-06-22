// MIT © 2016 azu
"use strict";
import assert from "node:assert";
import { describe, it, beforeAll, afterAll } from "vitest";
import path from "node:path";
import os from "node:os";
import sh from "shelljs";
import fs from "node:fs";
import { CacheBacker, CacheBackerOptions } from "../../src/engine/execute-file-backers/cache-backer.js";
import { TextlintMessage } from "@textlint/types";

describe("CacheBacker", function () {
    let configDir: string;
    beforeAll(function () {
        configDir = path.join(os.tmpdir(), "textlint-config");
        sh.mkdir("-p", configDir);
    });
    afterAll(function () {
        sh.rm("-r", configDir);
    });
    describe("when previously have success result", function () {
        it("shouldExecute return false", async () => {
            const testCacheDir = path.join(configDir, "success-test");
            sh.mkdir("-p", testCacheDir);
            const config: CacheBackerOptions = {
                cache: true,
                cacheLocation: path.resolve(testCacheDir, ".cache"),
                hash: "test-hash"
            };
            const cacheBacker = new CacheBacker(config);
            const testFilePath = path.resolve(process.cwd(), "test/execute-file-backers/fixtures/test.md");

            // Ensure the file exists and is stable
            if (!fs.existsSync(testFilePath)) {
                throw new Error(`Test file does not exist: ${testFilePath}`);
            }

            const prevResult = { filePath: testFilePath, messages: [] };
            // prev
            cacheBacker.didExecute({ result: prevResult });
            cacheBacker.afterAll();

            // Small delay to ensure file system consistency
            await new Promise((resolve) => setTimeout(resolve, 10));

            // next - create new instance to simulate next run
            const nextCacheBacker = new CacheBacker(config);
            const shouldExecute = nextCacheBacker.shouldExecute({ filePath: prevResult.filePath });
            // If file hasn't changed and config hash matches, should not execute (return false)
            assert.ok(shouldExecute === false);
        });
    });

    describe("when previously have failure result", function () {
        it("shouldExecute return true", () => {
            const testCacheDir = path.join(configDir, "failure-test");
            sh.mkdir("-p", testCacheDir);
            const config: CacheBackerOptions = {
                cache: true,
                cacheLocation: path.resolve(testCacheDir, ".cache"),
                hash: "test-hash"
            };
            const cacheBacker = new CacheBacker(config);
            const prevResult = {
                filePath: path.resolve(process.cwd(), "test/execute-file-backers/fixtures/test.md"),
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
            const testCacheDir = path.join(configDir, "location-test");
            sh.mkdir("-p", testCacheDir);
            const cacheFilePath = path.resolve(testCacheDir, ".cache");
            const config: CacheBackerOptions = {
                cache: true,
                cacheLocation: cacheFilePath,
                hash: "test-hash"
            };
            const cacheBacker = new CacheBacker(config);
            const filePath = path.resolve(process.cwd(), "test/execute-file-backers/fixtures/test.md");
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
