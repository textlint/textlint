// Plugin
import { TxtParentNode } from "@textlint/ast-node-types";
/**
 * textlint plugin option values is object or boolean.
 * if this option value is false, disable the plugin.
 */
export declare type TextlintPluginOptions = {
    [index: string]: any;
};

export interface TextlintPluginProcessorConstructor extends Function {
    new (options?: TextlintPluginOptions): TextlintPluginProcessor;

    /**
     * Should defined `availableExtensions()` as instance method instead of static method.
     * @deprecated textlint@11+
     * @see https://github.com/textlint/textlint/issues/531
     */
    availableExtensions?(): Array<string>;
}

export declare class TextlintPluginProcessor {
    constructor(options?: TextlintPluginOptions);

    /**
     * Return available extensions for this plugin.
     * This extension should start with `.`(dot).
     * Example is [".md", ".mkd"]
     */
    availableExtensions(): Array<string>;

    processor(
        extension: string
    ): {
        preProcess(text: string, filePath?: string): TxtParentNode;
        postProcess(messages: Array<any>, filePath?: string): { messages: Array<any>; filePath: string };
    };
}

// textlint plugin module should export this interface
export interface TextlintPluginCreator {
    Processor: TextlintPluginProcessorConstructor;
}
