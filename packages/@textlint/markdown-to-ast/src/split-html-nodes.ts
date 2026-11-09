import { ASTNodeTypes } from "@textlint/ast-node-types";
import type { TxtNode, TxtNodeLocation, TxtNodeRange } from "@textlint/ast-node-types";
import { StructuredSource } from "structured-source";

/**
 * Block-level tag names recognised by CommonMark's Type 6 HTML block rule.
 * When a line starts with one of these tags (or its closing tag), the parser
 * treats everything until the next blank line as a single HTML block.
 *
 * Source: https://spec.commonmark.org/0.31.2/#html-blocks (Type 6)
 */
const BLOCK_LEVEL_TAGS = [
    "address", "article", "aside", "base", "basefont", "blockquote", "body",
    "caption", "center", "col", "colgroup", "dd", "details", "dialog", "dir",
    "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form",
    "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header",
    "hr", "html", "iframe", "legend", "li", "link", "main", "menu", "menuitem",
    "nav", "noframes", "ol", "optgroup", "option", "p", "param", "section",
    "source", "summary", "table", "tbody", "td", "tfoot", "th", "thead",
    "title", "tr", "track", "ul"
] as const;

// Pre-compute a set for O(1) lookup
const BLOCK_LEVEL_TAG_SET = new Set<string>(BLOCK_LEVEL_TAGS);

// Matches the opening portion: <tagname ...> or </tagname>
const OPEN_TAG_RE = /^<(\/?)([A-Za-z][A-Za-z0-9-]*)\b/;
// Matches a complete tag pair on a single line like <h2>head</h2>
const COMPLETE_TAG_PAIR_RE = /^<[A-Za-z][A-Za-z0-9-]*\b[^>]*>[\s\S]*<\/[A-Za-z][A-Za-z0-9-]*\s*>\s*$/;
// Matches a self-closing or void tag on a single line like <hr/> or <hr>
const SELF_CLOSING_OR_VOID_RE = /^<[A-Za-z][A-Za-z0-9-]*\b[^>]*\/?>\s*$/;
// Matches a closing tag on a single line like </div>
const CLOSING_TAG_RE = /^<\/[A-Za-z][A-Za-z0-9-]*\s*>\s*$/;

/**
 * Determines whether a single line of text constitutes a complete,
 * self-contained block-level HTML element.
 *
 * "Self-contained" means the tag opens and closes on the same line
 * (e.g. `<h2>head</h2>`, `<hr>`, `</div>`), which is the scenario
 * described in issue #2008 where consecutive such lines should each
 * become their own node.
 *
 * @param line - A single line of text (without trailing newline), already trimmed
 * @returns true if the line is a self-contained block-level HTML element
 */
function isSelfContainedBlockLevelHtmlLine(line: string): boolean {
    const match = OPEN_TAG_RE.exec(line);
    if (!match) {
        return false;
    }
    const isClosingSlash = match[1] === "/";
    const tagName = match[2].toLowerCase();

    // Must be a block-level tag (per CommonMark Type 6 list)
    if (!BLOCK_LEVEL_TAG_SET.has(tagName)) {
        return false;
    }

    // Case 1: closing tag on its own line, e.g. </div>
    if (isClosingSlash) {
        return CLOSING_TAG_RE.test(line);
    }

    // Case 2: complete tag pair on one line, e.g. <h2>head</h2>
    if (COMPLETE_TAG_PAIR_RE.test(line)) {
        return true;
    }

    // Case 3: self-closing or void tag, e.g. <hr>, <hr/>, <br/>
    if (SELF_CLOSING_OR_VOID_RE.test(line)) {
        return true;
    }

    return false;
}

/**
 * Creates a location object from offsets using StructuredSource.
 * StructuredSource returns { line, column } where line starts at 1 and column at 0.
 */
function toLoc(
    source: StructuredSource,
    startOffset: number,
    endOffset: number
): TxtNodeLocation {
    const startLoc = source.indexToPosition(startOffset);
    const endLoc = source.indexToPosition(endOffset);
    return {
        start: { line: startLoc.line, column: startLoc.column },
        end: { line: endLoc.line, column: endLoc.column }
    };
}

/**
 * Splits multi-line Html nodes where individual lines are self-contained
 * block-level HTML elements into separate Html nodes, with any non-HTML
 * lines between them becoming Paragraph nodes.
 *
 * This is a post-processing workaround for issue #2008:
 * https://github.com/textlint/textlint/issues/2008
 *
 * CommonMark's Type 6 HTML block rule causes the parser (remark-parse) to
 * swallow everything until a blank line into a single Html node. When a
 * document contains consecutive block-level tags on separate lines without
 * blank lines between them — e.g.:
 *
 *   <h2>head</h2>
 *   text
 *   <h2>head</h2>
 *
 * — the parser produces a single Html node containing all three lines,
 * making the "text" line invisible to textlint rules. This function splits
 * such nodes so that each self-contained HTML line becomes its own Html
 * node and each non-HTML line becomes a Paragraph node. This makes node
 * detection consistent regardless of blank-line placement, as requested
 * in the issue.
 *
 * Splitting only occurs when the Html node contains at least one
 * self-contained block-level HTML line on a separate line. Multi-line
 * HTML blocks where a tag spans multiple lines (e.g. `<div>\n\tfoo\n</div>`)
 * are left unchanged, since those are genuinely single HTML blocks.
 *
 * This approach mirrors the existing workaround pattern in commit c99218e
 * which added post-processing in the AST mapping layer to fix broken nodes
 * from the parser.
 *
 * @param ast - The root AST node (will be mutated in place)
 * @param source - StructuredSource for offset-to-position conversion
 * @param textWithoutBOM - The source text without BOM
 */
export function splitHtmlNodes(
    ast: TxtNode,
    source: StructuredSource,
    textWithoutBOM: string
): void {
    walkAndSplit(ast, source, textWithoutBOM);
}

/**
 * Recursively walks the AST, replacing qualifying Html nodes in children arrays.
 */
function walkAndSplit(
    node: TxtNode,
    source: StructuredSource,
    textWithoutBOM: string
): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyNode = node as any;

    if (!anyNode.children || !Array.isArray(anyNode.children)) {
        return;
    }

    const newChildren: TxtNode[] = [];
    let modified = false;

    for (const child of anyNode.children as TxtNode[]) {
        if (isSplittableHtmlNode(child)) {
            const splitNodes = splitSingleHtmlNode(child, source, textWithoutBOM);
            if (splitNodes !== null) {
                newChildren.push(...splitNodes);
                modified = true;
                continue;
            }
        }
        newChildren.push(child);
    }

    if (modified) {
        anyNode.children = newChildren;
    }

    // Recurse into children
    for (const child of anyNode.children as TxtNode[]) {
        walkAndSplit(child, source, textWithoutBOM);
    }
}

/**
 * Checks whether a node is an Html node that might be splittable.
 * A node is splittable if it's an Html node with a multi-line value.
 */
function isSplittableHtmlNode(node: TxtNode): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyNode = node as any;
    if (anyNode.type !== ASTNodeTypes.Html) {
        return false;
    }
    if (typeof anyNode.value !== "string") {
        return false;
    }
    return anyNode.value.includes("\n");
}

/**
 * Attempts to split a single Html node into multiple nodes.
 *
 * Returns an array of nodes if splitting is applicable, or null if the
 * node should be kept as-is.
 *
 * Splitting is applicable when the Html node's value contains multiple
 * lines, and at least one line (other than the first) is a self-contained
 * block-level HTML element. Each self-contained HTML line becomes an Html
 * node; each non-HTML line becomes a Paragraph node with a Str child.
 *
 * Lines that are part of a multi-line HTML block (e.g. an opening tag on
 * one line and a closing tag on another) are NOT split — the function
 * detects this by checking if any line is a self-contained HTML element.
 * If no line is self-contained, the node is kept as-is.
 */
function splitSingleHtmlNode(
    node: TxtNode,
    source: StructuredSource,
    textWithoutBOM: string
): TxtNode[] | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyNode = node as any;
    const value: string = anyNode.value;

    // Split the value into individual lines (without trailing newlines)
    const lines = value.split("\n");

    // Need at least 2 lines to be worth splitting
    if (lines.length < 2) {
        return null;
    }

    // Check each line: is it a self-contained block-level HTML element?
    const lineFlags: boolean[] = lines.map((line) => isSelfContainedBlockLevelHtmlLine(line.trim()));

    // At least one line must be a self-contained HTML element for splitting
    // to be considered. If none are, this is a genuine multi-line HTML block.
    const hasHtmlLine = lineFlags.some((flag) => flag);
    if (!hasHtmlLine) {
        return null;
    }

    // Safety check: if any line starts with an HTML tag (< or </) but is NOT
    // a self-contained block-level HTML element, this is likely a genuine
    // multi-line HTML block (e.g. <div>\nfoo\n</div>) and should NOT be split.
    // We only split when all HTML-looking lines are self-contained.
    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed === "") {
            continue;
        }
        if (OPEN_TAG_RE.test(trimmed) && !lineFlags[i]) {
            // This line looks like HTML (starts with <tag) but is not
            // self-contained — it's part of a multi-line HTML block.
            return null;
        }
    }

    // Build the replacement nodes
    const nodeRange = anyNode.range as [number, number];
    const startOffset = nodeRange[0];

    const result: TxtNode[] = [];
    let currentOffset = startOffset;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Skip empty lines (can happen with trailing newlines)
        if (trimmedLine === "") {
            currentOffset += line.length + 1; // line content + newline
            continue;
        }

        // Find the actual position of this line's content in the source
        const sourceFromOffset = textWithoutBOM.slice(currentOffset);
        const trimmedStartInSlice = sourceFromOffset.indexOf(trimmedLine);
        if (trimmedStartInSlice === -1) {
            // Fallback: shouldn't happen, but if it does, keep original node
            return null;
        }

        const contentStart = currentOffset + trimmedStartInSlice;
        const contentEnd = contentStart + trimmedLine.length;

        if (lineFlags[i]) {
            // This line is a self-contained block-level HTML element → Html node
            const loc = toLoc(source, contentStart, contentEnd);
            result.push({
                type: ASTNodeTypes.Html,
                value: trimmedLine,
                raw: trimmedLine,
                range: [contentStart, contentEnd] as TxtNodeRange,
                loc
            } as unknown as TxtNode);
        } else {
            // This line is non-HTML → Paragraph node with Str child
            const paragraphLoc = toLoc(source, contentStart, contentEnd);

            const strNode = {
                type: ASTNodeTypes.Str,
                value: trimmedLine,
                raw: trimmedLine,
                range: [contentStart, contentEnd] as TxtNodeRange,
                loc: toLoc(source, contentStart, contentEnd)
            } as unknown as TxtNode;

            result.push({
                type: ASTNodeTypes.Paragraph,
                children: [strNode],
                raw: trimmedLine,
                range: [contentStart, contentEnd] as TxtNodeRange,
                loc: paragraphLoc
            } as unknown as TxtNode);
        }

        // Advance offset past this line and its trailing newline
        currentOffset = contentEnd;
        if (i < lines.length - 1) {
            currentOffset += 1; // newline character
        }
    }

    // If we ended up with only 1 node, keep original
    if (result.length <= 1) {
        return null;
    }

    return result;
}
