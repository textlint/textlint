// LICENSE : MIT
"use strict";
import type { TxtBreakNode, TxtDocumentNode, TxtParagraphNode, TxtStrNode } from "@textlint/ast-node-types";
import { Syntax } from "./plaintext-syntax.js";

const BOM = 0xfeff;

/**
 * Create a `Str` node for the text of one line, without its line ending.
 */
function createStr(text: string, start: number, end: number, line: number): TxtStrNode {
    const raw = text.slice(start, end);
    return {
        type: Syntax.Str,
        raw,
        value: raw,
        range: [start, end],
        loc: {
            start: { line, column: 0 },
            end: { line, column: end - start }
        }
    };
}

/**
 * Create a `Paragraph` node for one line that is not empty.
 * The paragraph has one `Str` that covers the whole line.
 */
function createParagraph(text: string, start: number, end: number, line: number): TxtParagraphNode {
    const str = createStr(text, start, end, line);
    return {
        type: Syntax.Paragraph,
        raw: str.raw,
        range: [start, end],
        loc: {
            start: { line, column: 0 },
            end: { line, column: end - start }
        },
        children: [str]
    };
}

/**
 * Create a `Break` node for the line ending of a line.
 * `column` is the column of the line ending in its line.
 * The position after a line ending is the start of the next line.
 */
function createBreak(text: string, start: number, end: number, line: number, column: number): TxtBreakNode {
    return {
        type: Syntax.Break,
        raw: text.slice(start, end),
        range: [start, end],
        loc: {
            start: { line, column },
            end: { line: line + 1, column: 0 }
        }
    };
}

/**
 * Parse plain text into TxtAST.
 *
 * - A line ends with LF, CR, CRLF, U+2028, or U+2029. CRLF is one line ending.
 * - Each line that is not empty becomes a `Paragraph` with one `Str`.
 * - Each line ending becomes a `Break`.
 * - An empty line has no `Paragraph`, so only its line ending becomes a `Break`.
 * - A BOM at the start of the text is not part of the AST.
 */
export function parse(input: string): TxtDocumentNode {
    const text = input.charCodeAt(0) === BOM ? input.slice(1) : input;
    // The line terminators of ECMAScript. `\r\n` comes first, so that it is one line ending
    const lineEnding = /\r\n|[\n\r\u2028\u2029]/g;
    const children: (TxtParagraphNode | TxtBreakNode)[] = [];
    let lineStart = 0;
    let line = 1;
    let match: RegExpExecArray | null;
    while ((match = lineEnding.exec(text)) !== null) {
        const lineEnd = match.index;
        if (lineEnd > lineStart) {
            children.push(createParagraph(text, lineStart, lineEnd, line));
        }
        children.push(createBreak(text, lineEnd, lineEnding.lastIndex, line, lineEnd - lineStart));
        lineStart = lineEnding.lastIndex;
        line++;
    }
    // The last line has no line ending
    if (lineStart < text.length) {
        children.push(createParagraph(text, lineStart, text.length, line));
    }
    return {
        type: Syntax.Document,
        raw: text,
        range: [0, text.length],
        loc: {
            start: { line: 1, column: 0 },
            // When the text ends with a line ending, the end is at column 0 of the next line
            end: { line, column: text.length - lineStart }
        },
        children
    };
}
