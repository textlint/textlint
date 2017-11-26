import { ASTNodeTypes } from "@textlint/ast-node-types";
import { SeverityLevelTypes } from "./shared/type/SeverityLevel";
import { TextLintRuleCreator } from "./core/rule-creator-helper";
export interface TextlintRuleOptions {
    [index: string]: any;
    severity?: SeverityLevelTypes;
}
export interface TextlintPluginOptions {
    [index: string]: any;
}
export interface TextlintKernelConstructorOptions {
    /**
     * Suppress messages of severity:warning and severity:info
     */
    quiet?: boolean;
}
export interface TextlintConfig {
    rulePaths?: string[];
    extensions?: string[];
    formatterName?: string;
    plugins?: string[];
    rulesBaseDirectory?: string;
    configFile?: string;
    disabledRules?: string[];
    presets?: string[];
    rulesConfig?: Object;
    /**
     * quite options
     */
    quiet?: boolean;
}
export interface TxtNode {
    type: keyof typeof ASTNodeTypes | string;
    raw: string;
    range: [number, number];
    loc: LineLocation;
    parent?: TxtNode;
}
export interface TxtTextNode extends TxtNode {
    value: string;
}
export interface TxtParentNode extends TxtNode {
    children: TxtNode[] | TxtTextNode[];
}
export interface TxtRootNode extends TxtNode {
    type: "Document";
    children: TxtNode[];
}
export interface LineLocation {
    start: Position;
    end: Position;
}
export interface Position {
    line: number;
    column: number;
}
export interface TextlintKernelProcessorConstructor extends Function {
    new (options?: TextlintPluginOptions | boolean): TextlintKernelProcessor;
    availableExtensions(): Array<string>;
}
export declare class TextlintKernelProcessor {
    constructor(options?: TextlintPluginOptions | boolean);
    static availableExtensions(): Array<string>;
    processor(extension: string): {
        preProcess(text: string, filePath?: string): TxtNode;
        postProcess(messages: Array<any>, filePath?: string): {
            messages: Array<any>;
            filePath: string;
        };
    };
}
export interface TextlintPluginCreator {
    Processor: TextlintKernelProcessorConstructor;
}
export interface TextlintKernelPlugin {
    pluginId: string;
    plugin: TextlintPluginCreator;
    options?: TextlintPluginOptions | boolean;
}
export interface TextlintKernelRule {
    ruleId: string;
    rule: TextLintRuleCreator;
    options?: TextlintRuleOptions | boolean;
}
export interface TextlintKernelFilterRule {
    ruleId: string;
    rule: any;
    options?: TextlintRuleOptions | boolean;
}
export interface TextlintKernelOptions {
    ext: string;
    filePath?: string;
    plugins?: TextlintKernelPlugin[];
    rules?: TextlintKernelRule[];
    filterRules?: TextlintKernelFilterRule[];
    configBaseDir?: string;
}
export declare class TextLintFixCommand {
    text: string;
    range: [number, number];
    isAbsolute: boolean;
}
export declare class TextlintMessage {
    type: string;
    ruleId: string;
    message: string;
    data?: any;
    fix?: TextLintFixCommand;
    line: number;
    column: number;
    index: number;
    severity?: number;
}
export interface TextlintResult {
    filePath: string;
    messages: TextlintMessage[];
}
export interface TextlintFixResult {
    filePath: string;
    output: string;
    messages: TextlintMessage[];
    applyingMessages: TextlintMessage[];
    remainingMessages: TextlintMessage[];
}
