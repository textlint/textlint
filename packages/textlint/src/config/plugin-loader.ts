import { TextLintModuleResolver } from "../engine/textlint-module-resolver";
import { moduleInterop } from "@textlint/module-interop";

const debug = require("debug")("textlint:plugin-loader");
const assert = require("assert");

/**
 * get plugin names from `configFileRaw` object
 * @param configFileRaw
 * @returns {Array}
 */
export function getPluginNames(configFileRaw: { plugins?: any }) {
    const plugins = configFileRaw.plugins;
    if (!plugins) {
        return [];
    }
    if (Array.isArray(plugins)) {
        return plugins;
    }
    return Object.keys(plugins);
}

/**
 * get pluginConfig object from `configFileRaw` that is loaded .textlintrc
 * @param {Object} configFileRaw
 * @returns {Object}
 * @example
 * ```js
 * "plugins": {
 *   "pluginA": {},
 *   "pluginB": {}
 * }
 * ```
 *
 * to
 *
 * ```js
 * {
 *   "pluginA": {},
 *   "pluginB": {}
 * }
 * ```
 *
 *
 *
 * ```js
 * "plugins": ["pluginA", "pluginB"]
 * ```
 *
 * to
 *
 * ```
 * // `true` means turn on
 * {
 *   "pluginA": true,
 *   "pluginB": true
 * }
 * ```
 */
export function getPluginConfig(configFileRaw: { [index: string]: any }): { [index: string]: any } {
    const plugins = configFileRaw.plugins;
    if (!plugins) {
        return {};
    }
    if (Array.isArray(plugins)) {
        if (plugins.length === 0) {
            return {};
        }
        // { "pluginA": true, "pluginB": true }
        return plugins.reduce((results, pluginName) => {
            results[pluginName] = true;
            return results;
        }, {});
    }
    return plugins;
}

export async function loadAvailableExtensions(
    pluginNames: string[] = [],
    moduleResolver: TextLintModuleResolver
): Promise<string[]> {
    const availableExtensions: string[] = [];
    for (const pluginName of pluginNames) {
        const pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        const plugin = moduleInterop(await import(pkgPath));
        if (!plugin.hasOwnProperty("Processor")) {
            continue;
        }
        const Processor = plugin.Processor;
        debug(`${pluginName} has Processor`);
        assert.ok(
            typeof Processor.availableExtensions === "function",
            "Processor.availableExtensions() should be implemented"
        );
        availableExtensions.push(...Processor.availableExtensions());
    }
    return availableExtensions;
}
