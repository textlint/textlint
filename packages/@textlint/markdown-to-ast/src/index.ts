import { SyntaxMap } from "./mapping/markdown-syntax-map";
import type { TxtDocumentNode } from "@textlint/ast-node-types";
import { ASTNodeTypes } from "@textlint/ast-node-types";
import traverse from "neotraverse/legacy";
import debug0 from "debug";
import { parseMarkdown } from "./parse-markdown";
import { StructuredSource } from "structured-source";

const debug = debug0("@textlint/markdown-to-ast");

export { ASTNodeTypes as Syntax };

/**
 * Workaround for remark-gfm issue: https://github.com/remarkjs/remark-gfm/issues/16
 *
 * remark-gfm generates AST nodes (especially Str and Link nodes inside tables)
 * that are missing essential position information (position.start, position.end).
 * This creates problems for textlint which relies on accurate position data for:
 * - Error reporting with line/column numbers
 * - Source code highlighting and navigation
 * - Rule application to specific text ranges
 *
 * This function attempts to reconstruct missing position information by:
 * 1. Finding sibling nodes with valid position data
 * 2. Calculating relative positions based on node content and structure
 * 3. Using StructuredSource for accurate line/column conversion
 *
 * The approach handles three scenarios:
 * - Reference node before target: Add accumulated lengths
 * - Reference node after target: Subtract accumulated lengths
 * - Parent as reference: Search within parent content
 *
 * @param targetNode - The node missing position information
 * @param parentNode - Parent node containing the target
 * @param source - StructuredSource for offset-to-position conversion
 * @param sourceText - Original source text for content extraction
 * @returns Calculated position data or null if calculation fails
 */
function calculatePositionFromSiblings(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    targetNode: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentNode: any,
    source: StructuredSource,
    sourceText: string
): {
    loc: { start: { line: number; column: number }; end: { line: number; column: number } };
    range: [number, number];
    raw: string;
} | null {
    if (!parentNode || !parentNode.children || !Array.isArray(parentNode.children)) {
        return null;
    }

    const children = parentNode.children;
    const targetIndex = children.indexOf(targetNode);

    if (targetIndex === -1) {
        return null;
    }

    // Find the nearest sibling with position information
    let referenceNode = null;
    let referenceIndex = -1;

    // Look for previous siblings first
    for (let i = targetIndex - 1; i >= 0; i--) {
        if (children[i] && children[i].position) {
            referenceNode = children[i];
            referenceIndex = i;
            break;
        }
    }

    // If no previous sibling found, look for next siblings
    if (!referenceNode) {
        for (let i = targetIndex + 1; i < children.length; i++) {
            if (children[i] && children[i].position) {
                referenceNode = children[i];
                referenceIndex = i;
                break;
            }
        }
    }

    // If no siblings with position found, try parent's position
    if (!referenceNode && parentNode.position) {
        referenceNode = parentNode;
        referenceIndex = 0; // Treat parent as reference point
    }

    if (!referenceNode || !referenceNode.position) {
        return null;
    }

    let estimatedStart: number;
    const targetValue = targetNode.value || targetNode.url || "";

    if (referenceIndex < targetIndex) {
        // Reference node is before target node
        estimatedStart = referenceNode.position.end.offset;

        // Add length of nodes between reference and target
        for (let i = referenceIndex + 1; i < targetIndex; i++) {
            const node = children[i];
            if (node.value && typeof node.value === "string") {
                estimatedStart += node.value.length;
            } else if (node.raw && typeof node.raw === "string") {
                estimatedStart += node.raw.length;
            } else {
                // Rough estimation for complex nodes
                estimatedStart += 1;
            }
        }
    } else if (referenceIndex > targetIndex) {
        // Reference node is after target node
        estimatedStart = referenceNode.position.start.offset;

        // Subtract estimated length of nodes between target and reference
        for (let i = targetIndex + 1; i < referenceIndex; i++) {
            const node = children[i];
            if (node.value && typeof node.value === "string") {
                estimatedStart -= node.value.length;
            } else if (node.raw && typeof node.raw === "string") {
                estimatedStart -= node.raw.length;
            } else {
                // Rough estimation for complex nodes
                estimatedStart -= 1;
            }
        }

        // Subtract target node's own length
        estimatedStart -= targetValue.length;
    } else {
        // Reference node is parent - search within parent's content
        const parentContent = sourceText.slice(referenceNode.position.start.offset, referenceNode.position.end.offset);

        // Try to find the target value within parent content
        const targetValueIndex = parentContent.indexOf(targetValue);
        if (targetValueIndex !== -1) {
            estimatedStart = referenceNode.position.start.offset + targetValueIndex;
        } else {
            // Fallback to start of parent
            estimatedStart = referenceNode.position.start.offset;
        }
    }

    // Ensure start position is not negative and within bounds
    estimatedStart = Math.max(0, Math.min(estimatedStart, sourceText.length - targetValue.length));

    const estimatedEnd = estimatedStart + targetValue.length;

    // Use StructuredSource to convert offsets to line/column
    const startLoc = source.indexToPosition(estimatedStart);
    const endLoc = source.indexToPosition(estimatedEnd);

    return {
        loc: {
            start: { line: startLoc.line, column: startLoc.column },
            end: { line: endLoc.line, column: endLoc.column }
        },
        range: [estimatedStart, estimatedEnd] as [number, number],
        raw: sourceText.slice(estimatedStart, estimatedEnd)
    };
}

/**
 * parse Markdown text and return ast mapped location info.
 * @param {string} text
 */
export function parse(text: string): TxtDocumentNode {
    // remark-parse's AST does not consider BOM
    // AST's position does not +1 by BOM
    // So, just trim BOM and parse it for `raw` property
    // textlint's SourceCode also take same approach - trim BOM and check the position
    // This means that the loading side need to consider BOM position - for example fs.readFile and text slice script.
    // https://github.com/micromark/micromark/blob/0f19c1ac25964872a160d8b536878b125ddfe393/lib/preprocess.mjs#L29-L31
    const hasBOM = text.charCodeAt(0) === 0xfeff;
    const textWithoutBOM = hasBOM ? text.slice(1) : text;
    const ast = parseMarkdown(textWithoutBOM);
    const source = new StructuredSource(textWithoutBOM);

    // Collect all nodes without position for advanced processing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nodesWithoutPosition: Array<{ node: any; parent: any }> = [];

    traverse(ast).forEach(function (node) {
        if (this.notLeaf) {
            if (node.type) {
                const replacedType = SyntaxMap[node.type as keyof typeof SyntaxMap];
                if (!replacedType) {
                    debug(`replacedType : ${replacedType} , node.type: ${node.type}`);
                } else {
                    node.type = replacedType;
                }
            }

            // map `range`, `loc` and `raw` to node
            if (node.position) {
                const position = node.position;
                // line start with 1
                // column start with 0
                const positionCompensated = {
                    start: { line: position.start.line, column: Math.max(position.start.column - 1, 0) },
                    end: { line: position.end.line, column: Math.max(position.end.column - 1, 0) }
                };
                const range = [position.start.offset, position.end.offset] as const;
                node.loc = positionCompensated;
                node.range = range;
                node.raw = textWithoutBOM.slice(range[0], range[1]);
                // Compatible for https://github.com/syntax-tree/unist, but it is hidden
                Object.defineProperty(node, "position", {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: position
                });
            } else if (node.type === "Str" || node.type === "Link") {
                // WORKAROUND: Handle nodes missing position information
                //
                // Due to remark-gfm issue (https://github.com/remarkjs/remark-gfm/issues/16),
                // some AST nodes (particularly Str and Link nodes within table cells)
                // are generated without proper position information. This is problematic
                // because textlint requires accurate position data for:
                // - Precise error reporting with line/column numbers
                // - Source code range highlighting in editors
                // - Rule application to specific text locations
                //
                // We collect these nodes for post-processing where we'll attempt to
                // reconstruct their position information using sibling nodes and parent context.

                // Get parent using this.parent

                const parent = this.parent;

                nodesWithoutPosition.push({ node, parent });
            }
        }
    });

    // WORKAROUND: Reconstruct position information for nodes missing it
    //
    // Process all nodes that were missing position information during the initial traversal.
    // This is necessary due to remark-gfm's incomplete position generation for certain nodes.
    // We attempt to calculate accurate position data using the advanced position calculation
    // that leverages sibling nodes and parent context.
    for (const { node, parent } of nodesWithoutPosition) {
        // Try to calculate position from siblings
        const calculatedPosition = calculatePositionFromSiblings(node, parent, source, textWithoutBOM);

        if (calculatedPosition) {
            // Successfully calculated position - use the computed values
            node.loc = calculatedPosition.loc;
            node.range = calculatedPosition.range;
            node.raw = calculatedPosition.raw;
        } else {
            // Fallback: Unable to calculate accurate position
            // Use basic fallback values to ensure the node has required properties
            // This prevents crashes but may result in less accurate position reporting
            const value = node.value || node.url || "";
            node.raw = value;
            node.loc = {
                start: { line: 1, column: 0 },
                end: { line: 1, column: value.length }
            };
            node.range = [0, value.length];
        }
    }

    return ast as TxtDocumentNode;
}
