// Plugin
import type { TxtDocumentNode } from "@textlint/ast-node-types";
import type { TextlintMessage } from "../Message/TextlintResult.js";

/**
 * textlint plugin option values is object or boolean.
 * if this option value is false, disable the plugin.
 */
export declare type TextlintPluginOptions = {
    [index: string]: unknown;
};

export type TextlintPluginPreProcessResult = TxtDocumentNode | { text: string; ast: TxtDocumentNode };
export type TextlintPluginPostProcessResult = { messages: Array<TextlintMessage>; filePath: string };

export interface TextlintPluginProcessorConstructor {
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

    processor(extension: string): {
        /**
         * plugin's `preProcess` return a TxtParentNode or text and AST.
         * If your plugin use different text for original file, the plugin should return the text and an AST for the text.
         * For example, a plugin for binary format.
         * textlint can not handle binary and the plugin should return Pseudo-text for original binary file.
         * @see https://github.com/textlint/textlint/issues/649
         * @param text
         * @param filePath
         */
        preProcess(
            text: string,
            filePath?: string
        ): TextlintPluginPreProcessResult | Promise<TextlintPluginPreProcessResult>;
        postProcess(
            messages: Array<TextlintMessage>,
            filePath?: string
        ): TextlintPluginPostProcessResult | Promise<TextlintPluginPostProcessResult>;
    };
}

// textlint plugin module should export this interface
export interface TextlintPluginCreator {
    Processor: TextlintPluginProcessorConstructor;
}
