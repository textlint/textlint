/**
 * Plugin Creator
 */
export declare class PluginCreatorSet {
    pluginsOption: {
        [index: string]: any;
    };
    pluginNames: string[];
    plugins: any[];
    rawPlugins: {
        [index: string]: any;
    };
    /**
     * @param {Object} [pluginObject]
     * @param {Object} [pluginOptionObject]
     * @constructor
     */
    constructor(pluginObject?: object, pluginOptionObject?: object);
    readonly availableExtensions: any;
    /**
     * Convert this to TextlintKernel rules format
     * @returns {Array}
     */
    toKernelPluginsFormat(): {
        pluginId: string;
        plugin: any;
        options: any;
    }[];
}
