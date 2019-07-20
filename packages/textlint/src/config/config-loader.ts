import { TextLintModuleResolver } from "../engine/textlint-module-resolver";
import { moduleInterop } from "@textlint/module-interop";

const rcConfigLoader = require("rc-config-loader");

/**
 * @param {string} configFilePath
 * @param {string} configFileName
 * @param {TextLintModuleResolver} moduleResolver
 * @returns {{ config: Object, filePath:string}}
 */
export function loadConfig(
    configFilePath: string,
    { configFileName, moduleResolver }: { configFileName: string; moduleResolver: TextLintModuleResolver }
) {
    // if specify Config module, use it
    if (configFilePath) {
        try {
            const modulePath = moduleResolver.resolveConfigPackageName(configFilePath);
            return {
                config: moduleInterop(require(modulePath)),
                filePath: modulePath
            };
        } catch (error) {
            // not found config module
        }
    }
    // auto or specify path to config file
    const result = rcConfigLoader(configFileName, {
        configFileName: configFilePath,
        defaultExtension: [".json", ".js", ".yml"]
    });
    if (result === undefined) {
        return {
            config: {},
            filePath: undefined
        };
    }
    return {
        config: result.config,
        filePath: result.filePath
    };
}
