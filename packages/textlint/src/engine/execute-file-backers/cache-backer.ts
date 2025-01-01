// MIT © 2016 azu
"use strict";
import fileEntryCache, { FileEntryCache } from "file-entry-cache";
import debug0 from "debug";
import path from "node:path";
import { AbstractBacker } from "./abstruct-backer";
import { TextlintResult } from "@textlint/kernel";

const debug = debug0("textlint:CacheBacker");

export type CacheBackerOptions = {
    /**
     * enable cache
     */
    cache: boolean;
    /**
     * path to cache file
     */
    cacheLocation: string;
    /**
     * Config hash value
     */
    hash: string;
};
type FileEntryCacheCustomData = {
    hashOfConfig: string;
};

export class CacheBacker implements AbstractBacker {
    private fileCache: FileEntryCache;
    private isEnabled: boolean;

    constructor(private config: CacheBackerOptions) {
        this.isEnabled = config.cache;
        const filename = path.basename(config.cacheLocation);
        const cacheDir = path.dirname(config.cacheLocation);
        // use the metadata for cache instead of the file content
        // TODO: if we want to reuse the cache in CI, we should use the file content cache and save relative path into the cache
        this.fileCache = fileEntryCache.create(filename, cacheDir, false);
    }

    /**
     * @param {string} filePath
     * @returns {boolean}
     */
    shouldExecute({ filePath }: { filePath: string }) {
        if (!this.isEnabled) {
            return true;
        }
        try {
            const descriptor = this.fileCache.getFileDescriptor(filePath);
            const meta = descriptor.meta || {};
            // if the config is changed or file is changed, should execute return true
            const isChanged =
                descriptor.changed || (meta.data as FileEntryCacheCustomData).hashOfConfig !== this.config.hash;
            debug(`Skipping file since hasn't changed: ${filePath}`);
            return isChanged;
        } catch (error) {
            debug(`shouldExecute: Failed to read cache file: ${filePath}`, error);
            return true; // if cache file version is changed, it may throw an error
        }
    }

    didExecute<R extends TextlintResult>({ result }: { result: R }) {
        if (!this.isEnabled) {
            return;
        }
        const filePath = result.filePath;
        try {
            const descriptor = this.fileCache.getFileDescriptor(filePath);
            const meta = descriptor.meta || {};
            /*
             * if a file contains messages we don't want to store the file in the cache
             * so we can guarantee that next execution will also operate on this file
             */
            if (result.messages.length > 0) {
                debug(`File has problems, skipping it: ${filePath}`);
                // remove the entry from the cache
                this.fileCache.removeEntry(filePath);
            } else {
                // cache `config.hash`
                meta.data = { hashOfConfig: this.config.hash };
            }
        } catch (error) {
            debug(`didExecute: Failed to read cache file: ${filePath}`, error);
        }
    }

    /**
     * destroy all cache
     */
    destroyCache() {
        this.fileCache.destroy();
    }

    afterAll() {
        // persist cache
        this.fileCache.reconcile();
    }
}
