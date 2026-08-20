// MIT © 2016 azu
"use strict";
import assert from "node:assert";
import { describe, it, beforeAll, afterAll } from "vitest";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { CacheBacker, CacheBackerOptions } from "../../src/engine/execute-file-backers/cache-backer.js";
import { TextlintMessage } from "@textlint/types";

describe("CacheBacker", function () {
    let configDir: string;
    beforeAll(function () {
        configDir = path.join(os.tmpdir(), "textlint-config");
        fs.mkdirSync(configDir, { recursive: true });
    });
    afterAll(function () {
        fs.rmSync(configDir, { recursive: true, force: true });
    });

    describe("when cacheStrategy is 'metadata'", function () {
        describe("when previously have success result", function () {
            it("shouldExecute return false", async () => {
                const testCacheDir = path.join(configDir, "metadata-success-test");
                fs.mkdirSync(testCacheDir, { recursive: true });
                const config: CacheBackerOptions = {
                    cache: true,
                    cacheLocation: path.resolve(testCacheDir, ".cache"),
                    hash: "test-hash",
                    cacheStrategy: "metadata"
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
                const shouldExecute = nextCacheBacker.shouldExecute({
                    filePath: prevResult.filePath
                });
                // If file hasn't changed and config hash matches, should not execute (return false)
                assert.strictEqual(shouldExecute, false);
            });
        });

        describe("when previously have failure result", function () {
            it("shouldExecute return true", () => {
                const testCacheDir = path.join(configDir, "metadata-failure-test");
                fs.mkdirSync(testCacheDir, { recursive: true });
                const config: CacheBackerOptions = {
                    cache: true,
                    cacheLocation: path.resolve(testCacheDir, ".cache"),
                    hash: "test-hash",
                    cacheStrategy: "metadata"
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
                const shouldExecute = cacheBacker.shouldExecute({
                    filePath: prevResult.filePath
                });
                assert.strictEqual(shouldExecute, true);
            });
        });
    });

    describe("when cacheStrategy is 'content'", function () {
        describe("when file content has not changed", function () {
            it("shouldExecute return false", () => {
                const testCacheDir = path.join(configDir, "content-success-test");
                fs.mkdirSync(testCacheDir, { recursive: true });
                const tempFile = path.join(testCacheDir, "temp.md");
                const initialContent = "Hello, world!\n";
                fs.writeFileSync(tempFile, initialContent, "utf-8");

                const config: CacheBackerOptions = {
                    cache: true,
                    cacheLocation: path.resolve(testCacheDir, ".cache"),
                    hash: "test-hash",
                    cacheStrategy: "content"
                };
                const cacheBacker = new CacheBacker(config);
                const prevResult = { filePath: tempFile, messages: [] };
                cacheBacker.didExecute({ result: prevResult });
                cacheBacker.afterAll();

                const nextCacheBacker = new CacheBacker(config);
                const shouldExecute = nextCacheBacker.shouldExecute({
                    filePath: tempFile
                });
                assert.strictEqual(shouldExecute, false);
            });
        });

        describe("when file content has changed", function () {
            it("shouldExecute return true", () => {
                const testCacheDir = path.join(configDir, "content-changed-test");
                fs.mkdirSync(testCacheDir, { recursive: true });
                const tempFile = path.join(testCacheDir, "temp.md");
                const initialContent = "Hello, world!\n";
                fs.writeFileSync(tempFile, initialContent, "utf-8");

                const config: CacheBackerOptions = {
                    cache: true,
                    cacheLocation: path.resolve(testCacheDir, ".cache"),
                    hash: "test-hash",
                    cacheStrategy: "content"
                };
                const cacheBacker = new CacheBacker(config);
                const prevResult = { filePath: tempFile, messages: [] };
                cacheBacker.didExecute({ result: prevResult });
                cacheBacker.afterAll();

                fs.writeFileSync(tempFile, "Changed content!\n", "utf-8");

                const nextCacheBacker = new CacheBacker(config);
                const shouldExecute = nextCacheBacker.shouldExecute({
                    filePath: tempFile
                });
                assert.strictEqual(shouldExecute, true);
            });
        });

        describe("when only mtime is changed", function () {
            it("shouldExecute return false", async () => {
                const testCacheDir = path.join(configDir, "content-mtime-test");
                fs.mkdirSync(testCacheDir, { recursive: true });
                const config: CacheBackerOptions = {
                    cache: true,
                    cacheLocation: path.resolve(testCacheDir, ".cache"),
                    hash: "test-hash",
                    cacheStrategy: "content"
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

                // Change only mtime while content stays same (e.g. CI checkout updates mtime)
                const stat = fs.statSync(testFilePath);
                const changedAtime = new Date(stat.atime.getTime() + 5000);
                const changedMtime = new Date(stat.mtime.getTime() + 5000);
                fs.utimesSync(testFilePath, changedAtime, changedMtime);

                // next - create new instance to simulate next run
                const nextCacheBacker = new CacheBacker(config);
                const shouldExecute = nextCacheBacker.shouldExecute({
                    filePath: prevResult.filePath
                });
                // "content" strategy must detect changes by content hash, not mtime
                assert.strictEqual(shouldExecute, false);
            });
        });

        describe("when previously have failure result", function () {
            it("shouldExecute return true even if content unchanged", () => {
                const testCacheDir = path.join(configDir, "content-failure-test");
                fs.mkdirSync(testCacheDir, { recursive: true });
                const tempFile = path.join(testCacheDir, "temp.md");
                fs.writeFileSync(tempFile, "Hello, world!\n", "utf-8");

                const config: CacheBackerOptions = {
                    cache: true,
                    cacheLocation: path.resolve(testCacheDir, ".cache"),
                    hash: "test-hash",
                    cacheStrategy: "content"
                };
                const cacheBacker = new CacheBacker(config);
                const prevResult = {
                    filePath: tempFile,
                    messages: [{} as TextlintMessage]
                };
                cacheBacker.didExecute({ result: prevResult });
                cacheBacker.afterAll();

                const nextCacheBacker = new CacheBacker(config);
                const shouldExecute = nextCacheBacker.shouldExecute({
                    filePath: tempFile
                });
                assert.strictEqual(shouldExecute, true);
            });
        });
    });

    describe("when specify `cacheLocation` options", function () {
        it("should save the specific path", () => {
            const testCacheDir = path.join(configDir, "location-test");
            fs.mkdirSync(testCacheDir, { recursive: true });
            const cacheFilePath = path.resolve(testCacheDir, ".cache");
            const config: CacheBackerOptions = {
                cache: true,
                cacheLocation: cacheFilePath,
                hash: "test-hash",
                cacheStrategy: "metadata"
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
