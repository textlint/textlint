// MIT © 2016 azu
"use strict";
// @ts-expect-error
import fileEntryCache from "file-entry-cache";
import debug0 from "debug";
import { AbstractBacker } from "./abstruct-backer";
const debug = debug0("textlint:CacheBacker");

import { TextlintResult } from "@textlint/kernel";

export class CacheBacker implements AbstractBacker {
    private fileCache: any;
    private isEnabled: boolean;

    /**
     * @param {Config} config
     */
    constructor(private config: { cache: boolean; cacheLocation: string; hash: string }) {
        /**
         * @type {boolean}
         */
        this.isEnabled = config.cache;
        this.fileCache = fileEntryCache.create(config.cacheLocation);
    }

    /**
     * @param {string} filePath
     * @returns {boolean}
     */
    shouldExecute({ filePath }: { filePath: string }) {
        if (!this.isEnabled) {
            return true;
        }
        const descriptor = this.fileCache.getFileDescriptor(filePath);
        const meta = descriptor.meta || {};
        // if the config is changed or file is changed, should execute return true
        const isChanged = descriptor.changed || meta.hashOfConfig !== this.config.hash;
        debug(`Skipping file since hasn't changed: ${filePath}`);
        return isChanged;
    }

    didExecute<R extends TextlintResult>({ result }: { result: R }) {
        if (!this.isEnabled) {
            return;
        }
        const filePath = result.filePath;
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
            meta.hashOfConfig = this.config.hash;
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
