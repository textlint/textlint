"use strict";
import {
    TextlintPluginCreator,
    TextlintPluginOptions,
    TextlintPluginProcessor,
    TextlintPluginProcessorConstructor
} from "@textlint/kernel";

const getPluginProcessors = (rawPluginObject: {
    [index: string]: TextlintPluginCreator;
}): TextlintPluginProcessorConstructor[] => {
    return Object.keys(rawPluginObject).map(key => {
        const textlintPluginCreator = rawPluginObject[key];
        return textlintPluginCreator.Processor;
    });
};

/**
 * Get instance/static `availableExtensions()` from TextlintPluginProcessor
 */
const getAvailableExtensions = (pluginProcessor: TextlintPluginProcessor): string[] => {
    if (typeof pluginProcessor.availableExtensions === "function") {
        return pluginProcessor.availableExtensions();
    }
    // It is compatible for textlint@10<=
    // Recommended: `availableExtensions()` should be defined as instance method.
    // https://github.com/textlint/textlint/issues/531
    const PluginProcessorConstructor = pluginProcessor.constructor as TextlintPluginProcessorConstructor;
    if (typeof PluginProcessorConstructor.availableExtensions === "function") {
        return PluginProcessorConstructor.availableExtensions();
    }
    throw new Error(`Plugin(${pluginProcessor}) should implement availableExtensions() method`);
};
const createPluginInstances = (
    rawPluginObject: { [index: string]: TextlintPluginCreator } = {},
    pluginOptionObject: { [index: string]: TextlintPluginOptions } = {}
): TextlintPluginProcessor[] => {
    const DefaultPluginConfigValue = true;
    return Object.keys(rawPluginObject).map(key => {
        const Processor = rawPluginObject[key].Processor;
        const ProcessorOption =
            pluginOptionObject[key] !== undefined ? pluginOptionObject[key] : DefaultPluginConfigValue;
        return new Processor(ProcessorOption);
    });
};

/**
 * Textlint Plugin Descriptor
 */
export class TextlintPluginDescriptor {
    pluginNames: string[];
    pluginProcessorConstructors: TextlintPluginProcessorConstructor[];
    pluginsCreator: { [index: string]: TextlintPluginCreator };
    pluginsOption: { [index: string]: TextlintPluginOptions };
    plugins: TextlintPluginProcessor[];

    /**
     * @param {Object} [pluginObject]
     * @param {Object} [pluginOptionObject]
     * @constructor
     */
    constructor(
        pluginObject: { [index: string]: TextlintPluginCreator } = {},
        pluginOptionObject: { [index: string]: TextlintPluginOptions } = {}
    ) {
        // raw plugin object
        this.pluginsCreator = pluginObject;
        // plugin Processor constructors
        this.pluginProcessorConstructors = getPluginProcessors(this.pluginsCreator);
        // plugin instances
        this.plugins = createPluginInstances(pluginObject, pluginOptionObject);
        // plugin names
        this.pluginNames = Object.keys(this.pluginsCreator);
        // plugin option values
        this.pluginsOption = pluginOptionObject;
    }

    get availableExtensions(): string[] {
        return this.plugins.reduce(
            (extensions, plugin) => {
                const extList = getAvailableExtensions(plugin);
                return extensions.concat(extList);
            },
            [] as string[]
        );
    }

    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    toKernelPluginsFormat() {
        return this.pluginNames.map(pluginName => {
            return {
                pluginId: pluginName,
                plugin: this.pluginsCreator[pluginName],
                options: this.pluginsOption[pluginName]
            };
        });
    }
}
