import { TxtNode } from "../textlint-kernel-interface";
export interface SourceCodePosition {
    line: number;
    column: number;
}
/**
 * Line number starts with 1.
 * Column number starts with 0.
 */
export interface SourceCodeLocation {
    start: SourceCodePosition;
    end: SourceCodePosition;
}
export declare type SourceCodeRange = [number, number];
/**
 * This class represent of source code.
 */
export default class SourceCode {
    hasBOM: boolean;
    text: string;
    ast: TxtNode;
    filePath: string | undefined;
    ext: string;
    private _structuredSource;
    /**
     * @param {string} text
     * @param {Object} ast
     * @param {string} ext
     * @param {string} [filePath]
     */
    constructor({text, ast, ext, filePath}: {
        text: string;
        ast: TxtNode;
        ext: string;
        filePath?: string;
    });
    /**
     * @returns {ASTNodeTypes}
     */
    getSyntax(): {
        Document: string;
        Paragraph: string;
        BlockQuote: string;
        ListItem: string;
        List: string;
        Header: string;
        CodeBlock: string;
        HtmlBlock: string;
        ReferenceDef: string;
        HorizontalRule: string;
        Comment: string;
        Str: string;
        Break: string;
        Emphasis: string;
        Strong: string;
        Html: string;
        Link: string;
        Image: string;
        Code: string;
        Delete: string;
    };
    /**
     * get filePath
     * @returns {string|undefined}
     */
    getFilePath(): string | undefined;
    /**
     * Gets the source code for the given node.
     * @param {TxtNode=} node The AST node to get the text for.
     * @param {int=} beforeCount The number of characters before the node to retrieve.
     * @param {int=} afterCount The number of characters after the node to retrieve.
     * @returns {string|null} The text representing the AST node.
     */
    getSource(node: TxtNode, beforeCount?: number, afterCount?: number): string | null;
    /**
     * @param {SourceCodeLocation} loc - location indicator.
     * @return {[ number, number ]} range.
     */
    locationToRange(loc: SourceCodeLocation): SourceCodeRange;
    /**
     * @param {[ number, number ]} range - pair of indice.
     * @return {SourceCodeLocation} location.
     */
    rangeToLocation(range: SourceCodeRange): SourceCodeLocation;
    /**
     * @param {Position} pos - position indicator.
     * @return {number} index.
     */
    positionToIndex(pos: SourceCodePosition): number;
    /**
     * @param {number} index - index to the source code.
     * @return {Position} position.
     */
    indexToPosition(index: number): SourceCodePosition;
}
