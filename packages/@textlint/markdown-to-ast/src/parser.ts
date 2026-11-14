// LICENSE : MIT
/**
 * CommonMark + GFM (table, strikethrough, task list, autolink literal, footnote) + frontmatter parser.
 *
 * Design: data-oriented
 *
 * - The parser does not create intermediate objects (tokens, events, mdast nodes).
 * - Nodes live in a flat pool that is "struct of arrays": each field is a typed array, and a node is an index.
 *   Tree links(parent, first child, next sibling...) are indexes too.
 * - Variable length data is stored in side tables: `seg*`(lines of leaf blocks) and `side`(decoded strings).
 * - Most of string values are not copied while parsing. They are sliced from the source at the end.
 * - The pool is reused between `parse()` calls, so parsing allocates almost nothing but the result.
 *
 * Phases:
 *
 * 1. block phase: scan lines and build block nodes. Leaf blocks keep their lines as segments.
 * 2. inline phase: parse segments of Paragraph/Header/TableCell into inline nodes.
 * 3. emit phase: walk the pool once and create TxtAST nodes directly.
 */
import type { TxtDocumentNode } from "@textlint/ast-node-types";
import { decodeNamedEntity } from "./entities.js";

// ---------------------------------------------------------------------------------------------------------
// Node kinds
// ---------------------------------------------------------------------------------------------------------
const Document = 0;
const Paragraph = 1;
const Header = 2;
const BlockQuote = 3;
const List = 4;
const ListItem = 5;
const CodeBlock = 6;
const HtmlBlock = 7;
const HorizontalRule = 8;
const Definition = 9;
const FootnoteDefinition = 10;
const Table = 11;
const TableRow = 12;
const TableCell = 13;
const Yaml = 14;
const Toml = 15;
const Json = 16;
const Str = 17;
const Break = 18;
const Emphasis = 19;
const Strong = 20;
const Delete = 21;
const Code = 22;
const Html = 23;
const Link = 24;
const Image = 25;
const LinkReference = 26;
const ImageReference = 27;
const FootnoteReference = 28;
// Pandoc-style inline note: ^[note]
const Footnote = 29;
const Dead = 255;

const TYPE_NAMES = [
    "Document",
    "Paragraph",
    "Header",
    "BlockQuote",
    "List",
    "ListItem",
    "CodeBlock",
    "Html",
    "HorizontalRule",
    "Definition",
    "footnoteDefinition",
    "Table",
    "TableRow",
    "TableCell",
    "Yaml",
    "Toml",
    "Json",
    "Str",
    "Break",
    "Emphasis",
    "Strong",
    "Delete",
    "Code",
    "Html",
    "Link",
    "Image",
    "LinkReference",
    "ImageReference",
    "FootnoteReference",
    // It is not defined in TxtAST, but the previous parser(remark-footnotes) outputs this type
    "footnote"
];
const REFERENCE_TYPES = ["shortcut", "collapsed", "full"];

// ---------------------------------------------------------------------------------------------------------
// Source and line table
// ---------------------------------------------------------------------------------------------------------
let src = "";
let len = 0;
let hasCR = false;
/** line start offsets. `LS[LN]` is a sentinel */
let LS = new Int32Array(256);
let LN = 0;

function buildLines(): void {
    LN = 0;
    let n = 0;
    let lines = LS;
    lines[n++] = 0;
    if (!hasCR) {
        let i = src.indexOf("\n");
        while (i !== -1) {
            if (n + 2 > lines.length) {
                lines = growInt32(lines);
            }
            lines[n++] = i + 1;
            i = src.indexOf("\n", i + 1);
        }
    } else {
        for (let i = 0; i < len; i++) {
            const c = src.charCodeAt(i);
            if (c === 10 || c === 13) {
                if (c === 13 && src.charCodeAt(i + 1) === 10) {
                    i++;
                }
                if (n + 2 > lines.length) {
                    lines = growInt32(lines);
                }
                lines[n++] = i + 1;
            }
        }
    }
    lines[n] = 0x7fffffff;
    LS = lines;
    LN = n;
}

function growInt32(a: Int32Array<ArrayBuffer>): Int32Array<ArrayBuffer> {
    const b = new Int32Array(a.length * 2);
    b.set(a);
    return b;
}

/** end offset of the line without line ending */
function lineEndOf(li: number): number {
    if (li + 1 >= LN) {
        return len;
    }
    const e = LS[li + 1];
    if (src.charCodeAt(e - 1) === 10) {
        return hasCR && src.charCodeAt(e - 2) === 13 ? e - 2 : e - 1;
    }
    return e - 1;
}

let lineCache = 0;

/** line index(0-based) of the offset */
function lineOf(offset: number): number {
    let li = lineCache;
    if (offset >= LS[li]) {
        if (offset < LS[li + 1]) {
            return li;
        }
        if (offset < LS[li + 2]) {
            return (lineCache = li + 1);
        }
    }
    let lo = 0;
    let hi = LN - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (LS[mid] <= offset) {
            lo = mid;
        } else {
            hi = mid - 1;
        }
    }
    li = lo;
    return (lineCache = li);
}

/** line ending string at the offset. "" if it is not a line ending */
function eolAt(i: number): string {
    const c = src.charCodeAt(i);
    if (c === 10) {
        return "\n";
    }
    if (c === 13) {
        return src.charCodeAt(i + 1) === 10 ? "\r\n" : "\r";
    }
    return "";
}

// ---------------------------------------------------------------------------------------------------------
// Node pool (struct of arrays)
// ---------------------------------------------------------------------------------------------------------
let cap = 1024;
let nKind = new Uint8Array(cap);
let nStart = new Int32Array(cap);
let nEnd = new Int32Array(cap);
let nParent = new Int32Array(cap);
let nFirst = new Int32Array(cap);
let nLast = new Int32Array(cap);
let nNext = new Int32Array(cap);
let nPrev = new Int32Array(cap);
/** kind specific data. See each kind */
let nA = new Int32Array(cap);
let nB = new Int32Array(cap);
let nC = new Int32Array(cap);
let nD = new Int32Array(cap);
let nCount = 0;
/** side table for strings and arrays */
let side: unknown[] = [];

function growPool(): void {
    cap *= 2;
    const k = new Uint8Array(cap);
    k.set(nKind);
    nKind = k;
    const grow = (a: Int32Array) => {
        const b = new Int32Array(cap);
        b.set(a);
        return b;
    };
    nStart = grow(nStart);
    nEnd = grow(nEnd);
    nParent = grow(nParent);
    nFirst = grow(nFirst);
    nLast = grow(nLast);
    nNext = grow(nNext);
    nPrev = grow(nPrev);
    nA = grow(nA);
    nB = grow(nB);
    nC = grow(nC);
    nD = grow(nD);
}

function newNode(kind: number, start: number, end: number): number {
    const i = nCount++;
    if (i >= cap) {
        growPool();
    }
    nKind[i] = kind;
    nStart[i] = start;
    nEnd[i] = end;
    nParent[i] = -1;
    nFirst[i] = -1;
    nLast[i] = -1;
    nNext[i] = -1;
    nPrev[i] = -1;
    nA[i] = -1;
    nB[i] = -1;
    nC[i] = -1;
    nD[i] = -1;
    return i;
}

function append(parent: number, child: number): void {
    const last = nLast[parent];
    nParent[child] = parent;
    nPrev[child] = last;
    nNext[child] = -1;
    if (last === -1) {
        nFirst[parent] = child;
    } else {
        nNext[last] = child;
    }
    nLast[parent] = child;
}

function insertBefore(ref: number, child: number): void {
    const parent = nParent[ref];
    const prev = nPrev[ref];
    nParent[child] = parent;
    nPrev[child] = prev;
    nNext[child] = ref;
    nPrev[ref] = child;
    if (prev === -1) {
        nFirst[parent] = child;
    } else {
        nNext[prev] = child;
    }
}

function insertAfter(ref: number, child: number): void {
    const parent = nParent[ref];
    const next = nNext[ref];
    nParent[child] = parent;
    nPrev[child] = ref;
    nNext[child] = next;
    nNext[ref] = child;
    if (next === -1) {
        nLast[parent] = child;
    } else {
        nPrev[next] = child;
    }
}

function unlink(node: number): void {
    const parent = nParent[node];
    const prev = nPrev[node];
    const next = nNext[node];
    if (prev === -1) {
        nFirst[parent] = next;
    } else {
        nNext[prev] = next;
    }
    if (next === -1) {
        nLast[parent] = prev;
    } else {
        nPrev[next] = prev;
    }
    nParent[node] = -1;
    nPrev[node] = -1;
    nNext[node] = -1;
    nKind[node] = Dead;
}

/** move siblings in (from, to) (exclusive both) to children of `target` */
function moveBetween(from: number, to: number, target: number): void {
    const first = nNext[from];
    if (first === to) {
        return;
    }
    const last = to === -1 ? nLast[nParent[from]] : nPrev[to];
    // detach
    nNext[from] = to;
    if (to === -1) {
        nLast[nParent[from]] = from;
    } else {
        nPrev[to] = from;
    }
    nPrev[first] = -1;
    nNext[last] = -1;
    nFirst[target] = first;
    nLast[target] = last;
    for (let c = first; c !== -1; c = nNext[c]) {
        nParent[c] = target;
    }
}

function addSide(value: unknown): number {
    side.push(value);
    return side.length - 1;
}

// ---------------------------------------------------------------------------------------------------------
// Segments: content lines of leaf blocks
// ---------------------------------------------------------------------------------------------------------
let segCap = 1024;
/** start offset of the content */
let segS = new Int32Array(segCap);
/** end offset of the content(end of line without line ending) */
let segE = new Int32Array(segCap);
/** Paragraph: count of skipped leading whitespaces. Code: count of virtual spaces by partial tab */
let segL = new Int32Array(segCap);
let segN = 0;

function pushSeg(s: number, e: number, lead: number): void {
    if (segN >= segCap) {
        segCap *= 2;
        const grow = (a: Int32Array) => {
            const b = new Int32Array(segCap);
            b.set(a);
            return b;
        };
        segS = grow(segS);
        segE = grow(segE);
        segL = grow(segL);
    }
    segS[segN] = s;
    segE[segN] = e;
    segL[segN] = lead;
    segN++;
}

// ---------------------------------------------------------------------------------------------------------
// Character classes
// ---------------------------------------------------------------------------------------------------------
const ASCII_PUNCT = new Uint8Array(128);
for (const ch of "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~") {
    ASCII_PUNCT[ch.charCodeAt(0)] = 1;
}
/** characters that the inline parser should stop at */
const SPECIAL = new Uint8Array(128);
for (const ch of "\n\\`*_~[]!<&hHwW^") {
    SPECIAL[ch.charCodeAt(0)] = 1;
}
const NON_ASCII_CLASS = new Uint8Array(65536);
const UNICODE_PUNCTUATION = /\p{P}|\p{S}/u;
const UNICODE_WHITESPACE = /\s/;

/**
 * 1: whitespace(or edge), 2: punctuation, 0: others
 */
function classify(c: number): number {
    if (c < 0) {
        return 1;
    }
    if (c < 128) {
        if (c === 32 || (c >= 9 && c <= 13)) {
            return 1;
        }
        return ASCII_PUNCT[c] ? 2 : 0;
    }
    let k = NON_ASCII_CLASS[c];
    if (k === 0) {
        const s = String.fromCharCode(c);
        k = UNICODE_WHITESPACE.test(s) ? 2 : UNICODE_PUNCTUATION.test(s) ? 3 : 1;
        NON_ASCII_CLASS[c] = k;
    }
    return k - 1;
}

function isAlnum(c: number): boolean {
    return (c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

function isAlpha(c: number): boolean {
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

/** `+ - . _` or alnum */
function isAtext(c: number): boolean {
    return isAlnum(c) || c === 43 || c === 45 || c === 46 || c === 95;
}

function normalizeIdentifier(value: string): string {
    return value
        .replace(/[\t\n\r ]+/g, " ")
        .replace(/^ | $/g, "")
        .toLowerCase()
        .toUpperCase();
}

// ---------------------------------------------------------------------------------------------------------
// Block phase
// ---------------------------------------------------------------------------------------------------------
/** open containers. `cNode[0]` is Document */
const cNode: number[] = [];
/** ListItem: required indent for continuation */
const cIndent: number[] = [];
let depth = 0;
/**
 * The position where containers are closed.
 * - start of the line: usual
 * - after continued prefix of the line: closed by new container
 * - EOF
 */
let closePos = 0;
/** open leaf block */
let leaf = -1;
let leafKind = 0;
// line state
let curLine = 0;
let lineStart = 0;
let lineEnd = 0;
let off = 0;
let col = 0;
let ptab = false;
let nns = 0;
let nnsCol = 0;
let indent = 0;
let blank = false;
// leaf state
let leafSeg0 = 0;
let leafContig = true;
let fenced = false;
let fChar = 0;
let fLen = 0;
let fIndent = 0;
let hType = 0;
/** indented code: end of segments of the last indented line */
let codeSegEnd = 0;
/** indented code: it can not continue to next line */
let codeSingleLine = false;
let pDefsDone = false;
// definitions
let definitions = new Set<string>();
let footnotes = new Set<string>();

function findNns(): void {
    let i = off;
    let c = col;
    while (i < lineEnd) {
        const ch = src.charCodeAt(i);
        if (ch === 32) {
            i++;
            c++;
        } else if (ch === 9) {
            i++;
            c += 4 - (c % 4);
        } else {
            break;
        }
    }
    blank = i >= lineEnd;
    nns = i;
    nnsCol = c;
    indent = c - col;
}

function advanceOffset(count: number, columns: boolean): void {
    while (count > 0 && off < lineEnd) {
        if (src.charCodeAt(off) === 9) {
            const toTab = 4 - (col % 4);
            if (columns) {
                ptab = toTab > count;
                const adv = toTab > count ? count : toTab;
                col += adv;
                if (!ptab) {
                    off++;
                }
                count -= adv;
            } else {
                ptab = false;
                col += toTab;
                off++;
                count--;
            }
        } else {
            ptab = false;
            off++;
            col++;
            count--;
        }
    }
}

function advanceNns(): void {
    off = nns;
    col = nnsCol;
    ptab = false;
}

function isBlankRange(s: number, e: number): boolean {
    for (let i = s; i < e; i++) {
        const c = src.charCodeAt(i);
        if (c !== 32 && c !== 9) {
            return false;
        }
    }
    return true;
}

function pushContainer(node: number, itemIndent: number): void {
    append(cNode[depth], node);
    depth++;
    cNode[depth] = node;
    cIndent[depth] = itemIndent;
}

/**
 * End offset of the container that is closed at `closePos`.
 * The container does not include trailing line endings and whitespaces if it includes a line ending.
 */
function containerEnd(node: number): number {
    const last = nLast[node];
    const min = last !== -1 ? nEnd[last] : nStart[node];
    let i = closePos;
    while (i > min) {
        const c = src.charCodeAt(i - 1);
        if (c !== 32 && c !== 9 && c !== 10 && c !== 13) {
            break;
        }
        i--;
    }
    for (let j = i; j < closePos; j++) {
        const c = src.charCodeAt(j);
        if (c === 10 || c === 13) {
            return j;
        }
    }
    return closePos < min ? min : closePos;
}

function popContainer(): void {
    const node = cNode[depth];
    const kind = nKind[node];
    const last = nLast[node];
    if (kind === BlockQuote) {
        nEnd[node] = containerEnd(node);
    } else if (kind === ListItem) {
        if (last !== -1) {
            nEnd[node] = nEnd[last];
            // spread: blank line between direct children
            let spread = 0;
            for (let c = nFirst[node]; c !== -1 && nNext[c] !== -1; c = nNext[c]) {
                if (lineOf(nStart[nNext[c]]) - lineOf(nEnd[c]) > 1) {
                    spread = 1;
                    break;
                }
            }
            nB[node] = spread;
        }
    } else if (kind === List) {
        const end = containerEnd(node);
        nEnd[node] = end;
        // spread: blank line between items, or blank lines after the last item in the list
        let spread = lineOf(end) - lineOf(nEnd[last]) > 1 ? 1 : 0;
        for (let c = nFirst[node]; spread === 0 && c !== -1 && nNext[c] !== -1; c = nNext[c]) {
            if (lineOf(nStart[nNext[c]]) - lineOf(nEnd[c]) > 1) {
                spread = 1;
            }
        }
        nD[node] = spread;
    } else if (kind === FootnoteDefinition) {
        nEnd[node] = containerEnd(node);
    }
    depth--;
}

/**
 * join content lines of the open leaf(code or html) as value
 */
function joinSegs(s0: number, s1: number): string {
    if (s1 <= s0) {
        return "";
    }
    if (leafContig) {
        return src.slice(segS[s0], segE[s1 - 1]);
    }
    let value = "";
    for (let k = s0; k < s1; k++) {
        if (k > s0) {
            value += eolAt(segE[k - 1]);
        }
        if (segL[k] > 0) {
            value += " ".repeat(segL[k]);
        }
        value += src.slice(segS[k], segE[k]);
    }
    return value;
}

function addLeafLine(): void {
    if (ptab) {
        pushSeg(off + 1, lineEnd, 4 - (col % 4));
        leafContig = false;
    } else {
        if (off !== lineStart && segN > leafSeg0) {
            leafContig = false;
        }
        pushSeg(off, lineEnd, 0);
    }
}

function stripOneEol(value: string): string {
    const n = value.length;
    if (n === 0) {
        return value;
    }
    const c = value.charCodeAt(n - 1);
    if (c === 10) {
        return value.slice(0, n > 1 && value.charCodeAt(n - 2) === 13 ? n - 2 : n - 1);
    }
    if (c === 13) {
        return value.slice(0, n - 1);
    }
    return value;
}

/**
 * @param mode 0: closed by the leaf itself or next block, 1: container is closed at current line,
 *  2: EOF, 3: container is closed at current line by new container
 */
function closeLeaf(mode: number): void {
    const node = leaf;
    if (node === -1) {
        return;
    }
    const kind = leafKind;
    leaf = -1;
    leafKind = 0;
    if (kind === Paragraph) {
        closeParagraph(node);
    } else if (kind === CodeBlock) {
        if (fenced) {
            // not closed by closing fence
            let value = joinSegs(leafSeg0, segN);
            if (mode === 2) {
                if (len > 0 && eolAt(len - 1) !== "") {
                    nEnd[node] = len;
                } else {
                    // The last line does not have line ending.
                    // If the line is empty, the code ends at the previous line ending
                    const last = segN - 1;
                    nEnd[node] = last >= leafSeg0 && segS[last] === segE[last] ? LS[lineOf(segS[last])] : len;
                    value = stripOneEol(value);
                }
            } else if (mode === 3) {
                // the line ending of the last line is included
                nEnd[node] = lineStart;
            } else {
                nEnd[node] = lineEndOf(curLine - 1);
                value = stripOneEol(value);
            }
            nC[node] = addSide(value);
        } else {
            // The code ends with the last indented line
            nEnd[node] = segE[codeSegEnd - 1];
            nC[node] = addSide(stripOneEol(joinSegs(leafSeg0, codeSegEnd)));
        }
    } else if (kind === HtmlBlock) {
        let value = joinSegs(leafSeg0, segN);
        if (mode === 3 && hType <= 5) {
            nEnd[node] = lineStart;
            value += eolAt(segE[segN - 1]);
        } else if (mode === 2 && hType <= 5) {
            nEnd[node] = len;
            if (len > 0) {
                value += eolAt(
                    hasCR && src.charCodeAt(len - 1) === 10 && src.charCodeAt(len - 2) === 13 ? len - 2 : len - 1
                );
            }
        } else {
            nEnd[node] = segE[segN - 1];
        }
        nA[node] = addSide(value);
    }
    // Table: `end` is updated by each row
}

function closeParagraph(node: number): void {
    if (!pDefsDone && src.charCodeAt(segS[leafSeg0]) === 91) {
        if (!resolveDefinitions(node)) {
            return;
        }
    }
    nStart[node] = segS[leafSeg0];
    nEnd[node] = segE[segN - 1];
    nC[node] = leafSeg0;
    nD[node] = segN - leafSeg0;
}

/**
 * Parse definitions at the head of the paragraph.
 * Definition nodes are inserted before the paragraph.
 * @returns false if the paragraph is removed
 */
function resolveDefinitions(node: number): boolean {
    pDefsDone = true;
    if (src.charCodeAt(segS[leafSeg0]) !== 91) {
        return true;
    }
    const count = segN - leafSeg0;
    setupBuf(leafSeg0, count, false);
    let p = bStart;
    let consumedLines = 0;
    // remark-footnotes compatible: `[^...]:` is not a definition
    while (p < bEnd && buf.charCodeAt(p) === 91 && buf.charCodeAt(p + 1) !== 94) {
        const end = parseDefinition(p);
        if (end === -1) {
            break;
        }
        const def = newNode(Definition, mapPos(p), mapPos(end));
        nA[def] = addSide(normalizeIdentifier(defLabel).toLowerCase());
        nB[def] = addSide(decodeString(defLabelRaw));
        nC[def] = defTitle === null ? -1 : addSide(defTitle);
        nD[def] = addSide(defUrl);
        definitions.add(normalizeIdentifier(defLabel));
        insertBefore(node, def);
        p = end + 1;
        // count lines
        if (count === 1) {
            consumedLines = 1;
        } else {
            while (consumedLines < count && vStart[consumedLines] < p) {
                consumedLines++;
            }
        }
    }
    if (consumedLines >= count) {
        unlink(node);
        segN = leafSeg0;
        return false;
    }
    leafSeg0 += consumedLines;
    return true;
}

function startBlock(matched: number, keepList: boolean, container = false): void {
    if (matched < depth) {
        closeLeaf(container ? 3 : 1);
        if (container) {
            closePos = off;
        }
        while (depth > matched) {
            popContainer();
        }
    } else if (leaf !== -1) {
        closeLeaf(0);
    }
    if (!keepList) {
        while (nKind[cNode[depth]] === List) {
            popContainer();
        }
    }
}

const HTML_BLOCK_NAMES =
    "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
const RE_HTML_1 = /^<(?:script|pre|style|textarea)(?:[ \t>]|$)/i;
const RE_HTML_1_END = /<\/(?:script|pre|style|textarea)>/i;
const RE_HTML_4 = /^<![A-Za-z]/;
const RE_HTML_6 = new RegExp(`^</?(?:${HTML_BLOCK_NAMES})(?:[ \\t]|/?>|$)`, "i");
const ATTRIBUTE = `(?:[ \\t]+[A-Za-z_:][A-Za-z0-9_.:-]*(?:[ \\t]*=[ \\t]*(?:[^ \\t"'=<>\`]+|'[^']*'|"[^"]*"))?)`;
const RE_HTML_7 = new RegExp(
    `^(?:<[A-Za-z][A-Za-z0-9-]*${ATTRIBUTE}*[ \\t]*/?>|</[A-Za-z][A-Za-z0-9-]*[ \\t]*>)[ \\t]*$`
);

function htmlBlockType(line: string, allow7: boolean): number {
    const c = line.charCodeAt(1);
    if (c === 33) {
        // <!
        if (line.startsWith("<!--")) {
            return 2;
        }
        if (line.startsWith("<![CDATA[")) {
            return 5;
        }
        return RE_HTML_4.test(line) ? 4 : 0;
    }
    if (c === 63) {
        return 3;
    }
    if (RE_HTML_1.test(line)) {
        return 1;
    }
    if (RE_HTML_6.test(line)) {
        return 6;
    }
    if (allow7 && RE_HTML_7.test(line)) {
        return 7;
    }
    return 0;
}

function htmlBlockEnds(line: string): boolean {
    switch (hType) {
        case 1:
            return RE_HTML_1_END.test(line);
        case 2:
            return line.includes("-->");
        case 3:
            return line.includes("?>");
        case 4:
            return line.includes(">");
        case 5:
            return line.includes("]]>");
    }
    return false;
}

/**
 * count cells of the table header row. 0 if it is not a header row
 */
function tableHeaderCells(s: number, e: number): number {
    let size = 0;
    let sizeB = 0;
    let seen = false;
    let i = s;
    if (src.charCodeAt(i) !== 124) {
        seen = true;
        sizeB = 1;
    }
    while (i < e) {
        let c = src.charCodeAt(i);
        if (c === 32 || c === 9) {
            i++;
            continue;
        }
        sizeB++;
        if (seen) {
            seen = false;
            size++;
        }
        if (c === 124) {
            i++;
            seen = true;
            continue;
        }
        while (i < e) {
            c = src.charCodeAt(i);
            if (c === 124 || c === 32 || c === 9) {
                break;
            }
            i++;
            if (c === 92 && i < e) {
                const d = src.charCodeAt(i);
                if (d === 92 || d === 124) {
                    i++;
                }
            }
        }
    }
    return sizeB > 1 ? size : 0;
}

let tableAlign: (string | null)[] = [];

/**
 * count cells of the table delimiter row. -1 if it is not a delimiter row
 */
function tableDelimiterCells(s: number, e: number): number {
    let i = s;
    let seen = false;
    let n = 0;
    const align: (string | null)[] = [];
    for (;;) {
        let c = src.charCodeAt(i);
        if (c === 124) {
            seen = true;
            i++;
            while (i < e && (src.charCodeAt(i) === 32 || src.charCodeAt(i) === 9)) {
                i++;
            }
            if (i >= e) {
                break;
            }
            c = src.charCodeAt(i);
        }
        let left = false;
        let right = false;
        if (c === 58) {
            seen = true;
            left = true;
            i++;
            if (i >= e || src.charCodeAt(i) !== 45) {
                return -1;
            }
        } else if (c !== 45 || i >= e) {
            return -1;
        }
        n++;
        while (i < e && src.charCodeAt(i) === 45) {
            i++;
        }
        if (i < e && src.charCodeAt(i) === 58) {
            seen = true;
            right = true;
            i++;
        }
        while (i < e && (src.charCodeAt(i) === 32 || src.charCodeAt(i) === 9)) {
            i++;
        }
        align.push(left ? (right ? "center" : "left") : right ? "right" : null);
        if (i >= e) {
            break;
        }
        if (src.charCodeAt(i) !== 124) {
            return -1;
        }
    }
    if (!seen) {
        return -1;
    }
    tableAlign = align;
    return n;
}

function addTableCell(row: number, start: number, end: number, cs: number, ce: number): void {
    const cell = newNode(TableCell, start, end);
    if (cs >= 0) {
        nC[cell] = segN;
        nD[cell] = 1;
        pushSeg(cs, ce, 0);
    } else {
        nD[cell] = 0;
    }
    append(row, cell);
}

function addTableRow(table: number, s: number, e: number): void {
    const row = newNode(TableRow, s, e);
    append(table, row);
    nEnd[table] = e;
    let inFirst = true;
    let hasLast = false;
    let lastStart = 0;
    let lastCS = -1;
    let lastCE = -1;
    let curStart = s;
    let curCS = -1;
    let curCE = -1;
    let i = s;
    while (i < e) {
        let c = src.charCodeAt(i);
        if (c === 32 || c === 9) {
            i++;
            continue;
        }
        if (c === 124) {
            if (inFirst) {
                inFirst = false;
            } else {
                if (hasLast) {
                    addTableCell(row, lastStart, curStart, lastCS, lastCE);
                }
                hasLast = true;
                lastStart = curStart;
                lastCS = curCS;
                lastCE = curCE;
                curStart = i;
                curCS = -1;
                curCE = -1;
            }
            i++;
            continue;
        }
        // data
        const dataStart = i;
        while (i < e) {
            c = src.charCodeAt(i);
            if (c === 124 || c === 32 || c === 9) {
                break;
            }
            i++;
            if (c === 92 && i < e) {
                const d = src.charCodeAt(i);
                if (d === 92 || d === 124) {
                    i++;
                }
            }
        }
        inFirst = false;
        if (curCS < 0) {
            if (hasLast) {
                addTableCell(row, lastStart, curStart, lastCS, lastCE);
                hasLast = false;
            }
            curCS = dataStart;
        }
        curCE = i;
    }
    if (hasLast) {
        addTableCell(row, lastStart, e, lastCS, lastCE);
    } else {
        addTableCell(row, curStart, e, curCS, curCE);
    }
}

function processLine(li: number): void {
    curLine = li;
    lineStart = LS[li];
    lineEnd = lineEndOf(li);
    off = lineStart;
    col = 0;
    ptab = false;
    closePos = lineStart;
    // 1. match open containers
    let i = 1;
    for (; i <= depth; i++) {
        const node = cNode[i];
        const kind = nKind[node];
        if (kind === List) {
            continue;
        }
        findNns();
        if (kind === BlockQuote) {
            if (indent <= 3 && !blank && src.charCodeAt(nns) === 62) {
                advanceNns();
                advanceOffset(1, false);
                if (off < lineEnd) {
                    const c = src.charCodeAt(off);
                    if (c === 32 || c === 9) {
                        advanceOffset(1, true);
                    }
                }
            } else {
                break;
            }
        } else if (kind === ListItem) {
            if (blank) {
                if (nFirst[node] === -1) {
                    break;
                }
                advanceOffset(cIndent[i], true);
            } else if (indent >= cIndent[i]) {
                advanceOffset(cIndent[i], true);
            } else {
                break;
            }
        } else {
            // FootnoteDefinition
            if (blank || indent >= 4) {
                advanceOffset(4, true);
            } else {
                break;
            }
        }
    }
    let matched = i - 1;
    const allMatched = matched === depth;
    // micromark compatible: new list item is restricted on the line that continues paragraph or indented code.
    // It affects all list items on the line
    const interrupt =
        allMatched && leaf !== -1 && (leafKind === Paragraph || (leafKind === CodeBlock && !fenced && !codeSingleLine));
    // micromark compatible: indented code can not continue if it starts at the line that closes containers
    let lazyLine = !allMatched || nKind[cNode[depth]] === List;

    // 2. continue the open leaf that is not a paragraph
    if (allMatched && leaf !== -1) {
        if (leafKind === CodeBlock) {
            if (fenced) {
                findNns();
                if (indent <= 3 && !blank && src.charCodeAt(nns) === fChar) {
                    let j = nns;
                    while (j < lineEnd && src.charCodeAt(j) === fChar) {
                        j++;
                    }
                    if (j - nns >= fLen && isBlankRange(j, lineEnd)) {
                        const node = leaf;
                        nEnd[node] = lineEnd;
                        nC[node] = addSide(joinSegs(leafSeg0, segN));
                        leaf = -1;
                        leafKind = 0;
                        return;
                    }
                }
                let k = fIndent;
                while (k > 0 && off < lineEnd) {
                    const c = src.charCodeAt(off);
                    if (c !== 32 && c !== 9) {
                        break;
                    }
                    advanceOffset(1, true);
                    k--;
                }
                addLeafLine();
                return;
            }
            findNns();
            if (codeSingleLine) {
                closeLeaf(0);
            } else if (indent >= 4) {
                advanceOffset(4, true);
                addLeafLine();
                codeSegEnd = segN;
                return;
            } else if (blank) {
                advanceOffset(4, true);
                addLeafLine();
                return;
            }
            closeLeaf(0);
        } else if (leafKind === HtmlBlock) {
            findNns();
            if (hType >= 6 && blank) {
                closeLeaf(0);
            } else {
                addLeafLine();
                if (hType <= 5 && htmlBlockEnds(src.slice(off, lineEnd))) {
                    closeLeaf(0);
                }
                return;
            }
        }
    }

    // 3. new blocks
    for (;;) {
        findNns();
        const inParagraph = leafKind === Paragraph;
        if (indent >= 4) {
            if (!inParagraph && !blank) {
                startBlock(matched, false);
                const node = newNode(CodeBlock, ptab ? off + 1 : off, lineEnd);
                codeSingleLine = lazyLine;
                advanceOffset(4, true);
                append(cNode[depth], node);
                leaf = node;
                leafKind = CodeBlock;
                fenced = false;
                leafSeg0 = segN;
                leafContig = true;
                addLeafLine();
                codeSegEnd = segN;
                return;
            }
            break;
        }
        if (blank) {
            break;
        }
        const c = src.charCodeAt(nns);
        if (c === 62) {
            // >
            startBlock(matched, false, true);
            advanceNns();
            advanceOffset(1, false);
            if (off < lineEnd) {
                const d = src.charCodeAt(off);
                if (d === 32 || d === 9) {
                    advanceOffset(1, true);
                }
            }
            pushContainer(newNode(BlockQuote, nns, lineEnd), 0);
            matched = depth;
            lazyLine = false;
            continue;
        }
        if (c === 35) {
            // #
            let j = nns;
            while (j < lineEnd && src.charCodeAt(j) === 35) {
                j++;
            }
            const level = j - nns;
            if (level <= 6 && (j >= lineEnd || src.charCodeAt(j) === 32 || src.charCodeAt(j) === 9)) {
                startBlock(matched, false);
                let cs = j;
                while (cs < lineEnd && (src.charCodeAt(cs) === 32 || src.charCodeAt(cs) === 9)) {
                    cs++;
                }
                let ce = lineEnd;
                while (ce > cs && (src.charCodeAt(ce - 1) === 32 || src.charCodeAt(ce - 1) === 9)) {
                    ce--;
                }
                let k = ce;
                while (k > cs && src.charCodeAt(k - 1) === 35) {
                    k--;
                }
                if (k < ce && (k === cs || src.charCodeAt(k - 1) === 32 || src.charCodeAt(k - 1) === 9)) {
                    ce = k;
                    while (ce > cs && (src.charCodeAt(ce - 1) === 32 || src.charCodeAt(ce - 1) === 9)) {
                        ce--;
                    }
                }
                const node = newNode(Header, nns, lineEnd);
                nA[node] = level;
                if (ce > cs) {
                    nC[node] = segN;
                    nD[node] = 1;
                    pushSeg(cs, ce, 0);
                } else {
                    nD[node] = 0;
                }
                append(cNode[depth], node);
                return;
            }
        } else if (c === 96 || c === 126) {
            // ` or ~
            let j = nns;
            while (j < lineEnd && src.charCodeAt(j) === c) {
                j++;
            }
            const size = j - nns;
            if (size >= 3 && (c === 126 || src.indexOf("`", j) === -1 || src.indexOf("`", j) >= lineEnd)) {
                startBlock(matched, false);
                const node = newNode(CodeBlock, nns, lineEnd);
                // info
                let is = j;
                while (is < lineEnd && (src.charCodeAt(is) === 32 || src.charCodeAt(is) === 9)) {
                    is++;
                }
                if (is < lineEnd) {
                    let ie = is;
                    while (ie < lineEnd && src.charCodeAt(ie) !== 32 && src.charCodeAt(ie) !== 9) {
                        ie++;
                    }
                    nA[node] = addSide(decodeString(src.slice(is, ie)));
                    let ms = ie;
                    while (ms < lineEnd && (src.charCodeAt(ms) === 32 || src.charCodeAt(ms) === 9)) {
                        ms++;
                    }
                    if (ms < lineEnd) {
                        nB[node] = addSide(decodeString(src.slice(ms, lineEnd)));
                    }
                }
                append(cNode[depth], node);
                leaf = node;
                leafKind = CodeBlock;
                fenced = true;
                fChar = c;
                fLen = size;
                fIndent = indent;
                leafSeg0 = segN;
                leafContig = true;
                return;
            }
        } else if (c === 60) {
            // <
            const line = src.slice(nns, lineEnd);
            const type = htmlBlockType(line, !inParagraph || matched < depth);
            if (type !== 0) {
                if (type === 7 && inParagraph) {
                    // micromark compatible: HTML(complete tag) on a lazy line closes the paragraph,
                    // but it is still in the containers
                    closeLeaf(0);
                } else {
                    startBlock(matched, false);
                }
                const node = newNode(HtmlBlock, ptab ? off + 1 : off, lineEnd);
                append(cNode[depth], node);
                leaf = node;
                leafKind = HtmlBlock;
                hType = type;
                leafSeg0 = segN;
                leafContig = true;
                addLeafLine();
                if (type <= 5 && htmlBlockEnds(line)) {
                    closeLeaf(0);
                }
                return;
            }
        }
        if (inParagraph && allMatched && matched === depth) {
            // setext heading
            if (c === 61 || c === 45) {
                let j = nns;
                while (j < lineEnd && src.charCodeAt(j) === c) {
                    j++;
                }
                if (isBlankRange(j, lineEnd)) {
                    const paragraph = leaf;
                    if (resolveDefinitions(paragraph)) {
                        nKind[paragraph] = Header;
                        nA[paragraph] = c === 61 ? 1 : 2;
                        nEnd[paragraph] = lineEnd;
                        nC[paragraph] = leafSeg0;
                        nD[paragraph] = segN - leafSeg0;
                        leaf = -1;
                        leafKind = 0;
                        return;
                    }
                    leaf = -1;
                    leafKind = 0;
                }
            }
        }
        if (c === 42 || c === 45 || c === 95) {
            // thematic break
            let j = nns;
            let count = 0;
            while (j < lineEnd) {
                const d = src.charCodeAt(j);
                if (d === c) {
                    count++;
                } else if (d !== 32 && d !== 9) {
                    break;
                }
                j++;
            }
            if (j >= lineEnd && count >= 3) {
                startBlock(matched, false);
                append(cNode[depth], newNode(HorizontalRule, nns, lineEnd));
                return;
            }
        }
        // list item
        let markerEnd = -1;
        let ordered = 0;
        let startNumber = -1;
        let listType = c;
        if (c === 42 || c === 43 || c === 45) {
            markerEnd = nns + 1;
        } else if (c >= 48 && c <= 57) {
            let j = nns;
            let num = 0;
            while (j < lineEnd && j - nns < 9) {
                const d = src.charCodeAt(j);
                if (d < 48 || d > 57) {
                    break;
                }
                num = num * 10 + (d - 48);
                j++;
            }
            if (j < lineEnd) {
                const d = src.charCodeAt(j);
                if (d === 46 || d === 41) {
                    markerEnd = j + 1;
                    ordered = 1;
                    startNumber = num;
                    listType = d;
                }
            }
        }
        if (markerEnd !== -1) {
            const next = markerEnd < lineEnd ? src.charCodeAt(markerEnd) : -1;
            if (next === -1 || next === 32 || next === 9) {
                if (
                    !(
                        interrupt &&
                        (isBlankRange(markerEnd, lineEnd) ||
                            (ordered === 1 && (markerEnd - nns !== 2 || src.charCodeAt(nns) !== 49)))
                    )
                ) {
                    const markerLinePos = off;
                    startBlock(matched, true, true);
                    const markerIndent = indent;
                    const markerStart = nns;
                    advanceNns();
                    advanceOffset(markerEnd - markerStart, true);
                    const spacesStartCol = col;
                    const spacesStartOff = off;
                    const spacesStartPtab: boolean = ptab;
                    do {
                        advanceOffset(1, true);
                    } while (
                        col - spacesStartCol < 5 &&
                        off < lineEnd &&
                        (src.charCodeAt(off) === 32 || src.charCodeAt(off) === 9)
                    );
                    const blankItem = off >= lineEnd;
                    const spacesAfterMarker = col - spacesStartCol;
                    let padding: number;
                    if (spacesAfterMarker >= 5 || spacesAfterMarker < 1 || blankItem) {
                        padding = markerEnd - markerStart + 1;
                        col = spacesStartCol;
                        off = spacesStartOff;
                        ptab = spacesStartPtab;
                        if (off < lineEnd && (src.charCodeAt(off) === 32 || src.charCodeAt(off) === 9)) {
                            advanceOffset(1, true);
                        }
                    } else {
                        padding = markerEnd - markerStart + spacesAfterMarker;
                    }
                    // list
                    let tip = cNode[depth];
                    if (nKind[tip] === List && (nA[tip] !== ordered || nC[tip] !== listType)) {
                        closePos = markerLinePos;
                        popContainer();
                        tip = cNode[depth];
                    }
                    if (nKind[tip] !== List) {
                        const list = newNode(List, markerStart, lineEnd);
                        nA[list] = ordered;
                        nB[list] = startNumber;
                        nC[list] = listType;
                        pushContainer(list, 0);
                    }
                    const item = newNode(ListItem, markerStart, lineEnd);
                    nB[item] = 0;
                    pushContainer(item, markerIndent + padding);
                    matched = depth;
                    lazyLine = false;
                    continue;
                }
            }
        }
        if (leafKind === Paragraph && allMatched && matched === depth && (c === 124 || c === 45 || c === 58)) {
            // table: paragraph's last line + delimiter row
            const cells = tableDelimiterCells(nns, lineEnd);
            if (cells > 0) {
                const hs = segS[segN - 1];
                const he = segE[segN - 1];
                if (tableHeaderCells(hs, he) === cells) {
                    const paragraph = leaf;
                    segN--;
                    leaf = -1;
                    leafKind = 0;
                    if (segN === leafSeg0) {
                        unlink(paragraph);
                    } else {
                        closeParagraph(paragraph);
                    }
                    const table = newNode(Table, hs, he);
                    nA[table] = addSide(tableAlign);
                    append(cNode[depth], table);
                    addTableRow(table, hs, he);
                    // The table includes the delimiter row
                    nEnd[table] = lineEnd;
                    leaf = table;
                    leafKind = Table;
                    return;
                }
            }
        }
        if (c === 91 && src.charCodeAt(nns + 1) === 94) {
            // [^label]:
            let j = nns + 2;
            let hasData = false;
            while (j < lineEnd) {
                const d = src.charCodeAt(j);
                if (d === 93 || d === 91) {
                    break;
                }
                if (d !== 32 && d !== 9) {
                    hasData = true;
                }
                if (d === 92 && j + 1 < lineEnd) {
                    const e = src.charCodeAt(j + 1);
                    if (e === 91 || e === 92 || e === 93) {
                        j++;
                    }
                }
                j++;
            }
            if (
                j < lineEnd &&
                hasData &&
                j - nns - 2 <= 999 &&
                src.charCodeAt(j) === 93 &&
                src.charCodeAt(j + 1) === 58 &&
                j + 1 < lineEnd
            ) {
                startBlock(matched, false, true);
                const label = src.slice(nns + 2, j);
                const node = newNode(FootnoteDefinition, nns, lineEnd);
                nA[node] = addSide(normalizeIdentifier(label).toLowerCase());
                nB[node] = addSide(decodeString(label));
                footnotes.add(normalizeIdentifier(label));
                advanceNns();
                advanceOffset(j + 2 - nns, false);
                // remark-footnotes compatible: only one whitespace is skipped after `:`
                // `[^1]:     text` is an indented code
                if (off < lineEnd && (src.charCodeAt(off) === 32 || src.charCodeAt(off) === 9)) {
                    advanceOffset(1, true);
                }
                pushContainer(node, 0);
                matched = depth;
                lazyLine = false;
                continue;
            }
        }
        break;
    }

    // 4. text
    if (matched < depth) {
        if (!blank && leafKind === Paragraph) {
            // lazy continuation line
            pushSeg(nns, lineEnd, nns - off);
            return;
        }
        closeLeaf(1);
        while (depth > matched) {
            popContainer();
        }
    }
    if (blank) {
        if (leaf !== -1) {
            closeLeaf(0);
        }
        return;
    }
    if (leafKind === Paragraph) {
        pushSeg(nns, lineEnd, nns - off);
        return;
    }
    if (leafKind === Table) {
        addTableRow(leaf, nns, lineEnd);
        return;
    }
    while (nKind[cNode[depth]] === List) {
        popContainer();
    }
    const paragraph = newNode(Paragraph, nns, lineEnd);
    append(cNode[depth], paragraph);
    leaf = paragraph;
    leafKind = Paragraph;
    leafSeg0 = segN;
    pDefsDone = false;
    pushSeg(nns, lineEnd, nns - off);
}

const FRONTMATTERS: [string, string, number][] = [
    ["---", "---", Yaml],
    ["+++", "+++", Toml],
    // Hexo style
    [";;;", ";;;", Json],
    // 11ty style
    ["---json", "---", Json],
    // Hugo style
    ["{", "}", Json]
];

/**
 * @returns count of consumed lines
 */
function parseFrontmatter(): number {
    const c = src.charCodeAt(0);
    if (c !== 45 && c !== 43 && c !== 59 && c !== 123) {
        return 0;
    }
    const firstEnd = lineEndOf(0);
    for (const [open, close, kind] of FRONTMATTERS) {
        if (!src.startsWith(open) || !isBlankRange(open.length, firstEnd)) {
            continue;
        }
        for (let li = 1; li < LN; li++) {
            const s = LS[li];
            if (s >= len && li > 1) {
                break;
            }
            const e = lineEndOf(li);
            if (src.startsWith(close, s) && s + close.length <= e && isBlankRange(s + close.length, e)) {
                const node = newNode(kind, 0, e);
                nA[node] = addSide(li > 1 ? src.slice(LS[1], lineEndOf(li - 1)) : "");
                append(0, node);
                return li + 1;
            }
        }
    }
    return 0;
}

function parseBlocks(): void {
    depth = 0;
    cNode[0] = newNode(Document, 0, len);
    leaf = -1;
    leafKind = 0;
    const lines = LN;
    for (let li = parseFrontmatter(); li < lines; li++) {
        if (LS[li] >= len) {
            break;
        }
        processLine(li);
    }
    curLine = lines > 1 && LS[lines - 1] >= len ? lines - 1 : lines;
    lineStart = len;
    closePos = len;
    let eofMode = 2;
    for (let i = 1; i <= depth; i++) {
        if (nKind[cNode[i]] === BlockQuote) {
            // The block quote does not continue to EOF line
            eofMode = 1;
        }
    }
    closeLeaf(eofMode);
    while (depth > 0) {
        popContainer();
    }
}

// ---------------------------------------------------------------------------------------------------------
// Virtual buffer: content of a leaf block without container prefixes
// ---------------------------------------------------------------------------------------------------------
/** single line: `src` itself. multiple lines: lines joined by "\n" */
let buf = "";
let bStart = 0;
let bEnd = 0;
let bMulti = false;
let bSeg0 = 0;
let vLines = 0;
/** start position of each line in `buf` */
const vStart: number[] = [];
let vCache = 0;

function setupBuf(s0: number, count: number, trim: boolean): void {
    bSeg0 = s0;
    vCache = 0;
    if (count === 1) {
        bMulti = false;
        buf = src;
        bStart = segS[s0];
        bEnd = segE[s0];
        vLines = 1;
    } else {
        bMulti = true;
        let text = "";
        for (let k = 0; k < count; k++) {
            if (k > 0) {
                text += "\n";
            }
            vStart[k] = text.length;
            text += src.slice(segS[s0 + k], segE[s0 + k]);
        }
        buf = text;
        bStart = 0;
        bEnd = text.length;
        vLines = count;
    }
    if (trim) {
        while (bEnd > bStart) {
            const c = buf.charCodeAt(bEnd - 1);
            if (c !== 32 && c !== 9) {
                break;
            }
            bEnd--;
        }
    }
}

function vLineOf(p: number): number {
    let k = vCache;
    while (k > 0 && p < vStart[k]) {
        k--;
    }
    while (k + 1 < vLines && p >= vStart[k + 1]) {
        k++;
    }
    return (vCache = k);
}

/** position in `buf` to offset in `src` */
function mapPos(p: number): number {
    if (!bMulti) {
        return p;
    }
    const k = vLineOf(p);
    return segS[bSeg0 + k] + (p - vStart[k]);
}

/** position in `buf` to offset in `src` as end of Str or Break */
function mapEnd(p: number): number {
    if (!bMulti) {
        return p;
    }
    const k = vLineOf(p);
    if (k > 0 && p === vStart[k]) {
        const e = segE[bSeg0 + k - 1];
        return e + eolAt(e).length;
    }
    return segS[bSeg0 + k] + (p - vStart[k]);
}

/** original line ending of "\n" at the position in `buf` */
function eolOfBuf(p: number): string {
    if (!hasCR) {
        return "\n";
    }
    return eolAt(segE[bSeg0 + vLineOf(p)]);
}

// ---------------------------------------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------------------------------------
let entityValue = "";

/**
 * parse character reference at `&`.
 * @returns end position, or -1. The value is `entityValue`
 */
function entityAt(text: string, i: number, e: number): number {
    let j = i + 1;
    if (j >= e) {
        return -1;
    }
    let c = text.charCodeAt(j);
    if (c === 35) {
        j++;
        c = text.charCodeAt(j);
        let code = 0;
        let digits = 0;
        if (c === 120 || c === 88) {
            j++;
            while (j < e && digits < 7) {
                c = text.charCodeAt(j);
                let d: number;
                if (c >= 48 && c <= 57) {
                    d = c - 48;
                } else if (c >= 97 && c <= 102) {
                    d = c - 87;
                } else if (c >= 65 && c <= 70) {
                    d = c - 55;
                } else {
                    break;
                }
                code = code * 16 + d;
                digits++;
                j++;
            }
            if (digits === 0 || digits > 6) {
                return -1;
            }
        } else {
            while (j < e && digits < 8) {
                c = text.charCodeAt(j);
                if (c < 48 || c > 57) {
                    break;
                }
                code = code * 10 + (c - 48);
                digits++;
                j++;
            }
            if (digits === 0 || digits > 7) {
                return -1;
            }
        }
        if (j >= e || text.charCodeAt(j) !== 59) {
            return -1;
        }
        if (
            code < 9 ||
            code === 11 ||
            (code > 13 && code < 32) ||
            (code > 126 && code < 160) ||
            (code > 55295 && code < 57344) ||
            (code > 64975 && code < 65008) ||
            (code & 65535) === 65535 ||
            (code & 65535) === 65534 ||
            code > 1114111
        ) {
            entityValue = "\uFFFD";
        } else {
            entityValue = String.fromCodePoint(code);
        }
        return j + 1;
    }
    while (j < e && j - i <= 32 && isAlnum(text.charCodeAt(j))) {
        j++;
    }
    if (j === i + 1 || j >= e || text.charCodeAt(j) !== 59) {
        return -1;
    }
    const value = decodeNamedEntity(text.slice(i + 1, j));
    if (value === undefined) {
        return -1;
    }
    entityValue = value;
    return j + 1;
}

/**
 * decode character escapes and character references
 */
function decodeString(value: string): string {
    if (value.indexOf("\\") === -1 && value.indexOf("&") === -1) {
        return value;
    }
    const e = value.length;
    let out = "";
    let from = 0;
    let i = 0;
    while (i < e) {
        const c = value.charCodeAt(i);
        if (c === 92) {
            const n = value.charCodeAt(i + 1);
            if (i + 1 < e && n < 128 && ASCII_PUNCT[n]) {
                out += value.slice(from, i);
                from = i + 1;
                i += 2;
                continue;
            }
        } else if (c === 38) {
            const end = entityAt(value, i, e);
            if (end !== -1) {
                out += value.slice(from, i) + entityValue;
                from = end;
                i = end;
                continue;
            }
        }
        i++;
    }
    return out + value.slice(from);
}

/**
 * decode text in `buf`: escapes, references, and line endings
 */
function decodeText(s: number, e: number): string {
    let out = "";
    let from = s;
    let i = s;
    while (i < e) {
        const c = buf.charCodeAt(i);
        if (c === 92) {
            const n = buf.charCodeAt(i + 1);
            if (i + 1 < e && n < 128 && ASCII_PUNCT[n]) {
                out += buf.slice(from, i);
                from = i + 1;
                i += 2;
                continue;
            }
        } else if (c === 38) {
            const end = entityAt(buf, i, e);
            if (end !== -1) {
                out += buf.slice(from, i) + entityValue;
                from = end;
                i = end;
                continue;
            }
        } else if (c === 10 && bMulti) {
            // remove whitespaces before line ending
            let j = i;
            while (j > from) {
                const d = buf.charCodeAt(j - 1);
                if (d !== 32 && d !== 9) {
                    break;
                }
                j--;
            }
            out += buf.slice(from, j) + eolOfBuf(i);
            from = i + 1;
        }
        i++;
    }
    return out + buf.slice(from, e);
}

/** `buf` slice with original line endings. whitespaces after line endings are removed */
export function sliceBuf(s: number, e: number): string {
    const value = buf.slice(s, e);
    if (!bMulti || !hasCR || value.indexOf("\n") === -1) {
        return value;
    }
    let out = "";
    let from = s;
    for (let i = s; i < e; i++) {
        if (buf.charCodeAt(i) === 10) {
            out += buf.slice(from, i) + eolOfBuf(i);
            from = i + 1;
        }
    }
    return out + buf.slice(from, e);
}

/**
 * `buf` slice with original line endings and leading whitespaces of lines.
 * @param skip max count of leading whitespaces to remove
 */
function sliceBufWithIndent(s: number, e: number, skip: number): string {
    if (!bMulti) {
        return buf.slice(s, e);
    }
    let out = "";
    let from = s;
    for (let i = s; i < e; i++) {
        if (buf.charCodeAt(i) === 10) {
            const k = bSeg0 + vLineOf(i);
            out += buf.slice(from, i) + eolAt(segE[k]);
            const lead = segL[k + 1] - skip;
            if (lead > 0) {
                out += src.slice(segS[k + 1] - lead, segS[k + 1]);
            }
            from = i + 1;
        }
    }
    return out + buf.slice(from, e);
}

// ---------------------------------------------------------------------------------------------------------
// Link parts
// ---------------------------------------------------------------------------------------------------------
let defLabel = "";
let defLabelRaw = "";
let defUrl = "";
let defTitle: string | null = null;
let partStart = 0;
let partEnd = 0;

/**
 * scan link label from `[`.
 * @returns position of `]`, or -1
 */
function scanLabel(p: number, e: number): number {
    let i = p + 1;
    let seen = false;
    while (i < e) {
        const c = buf.charCodeAt(i);
        if (c === 93) {
            return seen && i - p - 1 <= 999 ? i : -1;
        }
        if (c === 91) {
            return -1;
        }
        if (c === 92) {
            const d = buf.charCodeAt(i + 1);
            if (i + 1 < e && (d === 91 || d === 92 || d === 93)) {
                i++;
            }
            seen = true;
        } else if (c !== 32 && c !== 9 && c !== 10) {
            seen = true;
        }
        i++;
    }
    return -1;
}

/**
 * scan link destination.
 * @returns end position, or -1. The raw destination is [partStart, partEnd)
 */
function scanDestination(p: number, e: number): number {
    let i = p;
    if (i >= e) {
        return -1;
    }
    let c = buf.charCodeAt(i);
    if (c === 60) {
        i++;
        while (i < e) {
            c = buf.charCodeAt(i);
            if (c === 62) {
                partStart = p + 1;
                partEnd = i;
                return i + 1;
            }
            if (c === 10 || c === 60) {
                return -1;
            }
            if (c === 92 && i + 1 < e) {
                const d = buf.charCodeAt(i + 1);
                if (d === 60 || d === 62 || d === 92) {
                    i++;
                }
            }
            i++;
        }
        return -1;
    }
    let balance = 0;
    while (i < e) {
        c = buf.charCodeAt(i);
        if (c === 40) {
            if (++balance > 32) {
                return -1;
            }
        } else if (c === 41) {
            if (balance === 0) {
                break;
            }
            balance--;
        } else if (c === 32 || c === 9 || c === 10) {
            break;
        } else if (c < 32 || c === 127) {
            return -1;
        } else if (c === 92 && i + 1 < e) {
            const d = buf.charCodeAt(i + 1);
            if (d === 40 || d === 41 || d === 92) {
                i++;
            }
        }
        i++;
    }
    if (i === p || balance !== 0) {
        return -1;
    }
    partStart = p;
    partEnd = i;
    return i;
}

/**
 * scan link title.
 * @returns end position, or -1. The raw title is [partStart, partEnd)
 */
function scanTitle(p: number, e: number): number {
    const open = buf.charCodeAt(p);
    const close = open === 40 ? 41 : open;
    if (open !== 34 && open !== 39 && open !== 40) {
        return -1;
    }
    let i = p + 1;
    while (i < e) {
        const c = buf.charCodeAt(i);
        if (c === close) {
            partStart = p + 1;
            partEnd = i;
            return i + 1;
        }
        if (c === 92 && i + 1 < e) {
            const d = buf.charCodeAt(i + 1);
            if (d === close || d === open || d === 92) {
                i++;
            }
        }
        i++;
    }
    return -1;
}

function skipWhitespace(p: number, e: number): number {
    while (p < e) {
        const c = buf.charCodeAt(p);
        if (c !== 32 && c !== 9 && c !== 10) {
            break;
        }
        p++;
    }
    return p;
}

function skipSpaces(p: number, e: number): number {
    while (p < e) {
        const c = buf.charCodeAt(p);
        if (c !== 32 && c !== 9) {
            break;
        }
        p++;
    }
    return p;
}

/**
 * parse definition at `[`.
 * @returns end position(line end), or -1. Results are `defLabel`, `defUrl`, `defTitle`
 */
function parseDefinition(p: number): number {
    const e = bEnd;
    const labelEnd = scanLabel(p, e);
    if (labelEnd === -1 || buf.charCodeAt(labelEnd + 1) !== 58 || labelEnd + 1 >= e) {
        return -1;
    }
    let q = skipWhitespace(labelEnd + 2, e);
    q = scanDestination(q, e);
    if (q === -1) {
        return -1;
    }
    defLabel = buf.slice(p + 1, labelEnd);
    defLabelRaw = sliceBufWithIndent(p + 1, labelEnd, 0);
    defUrl = decodeString(buf.slice(partStart, partEnd));
    defTitle = null;
    // title
    const t = skipWhitespace(q, e);
    if (t > q && t < e) {
        const titleEnd = scanTitle(t, e);
        if (titleEnd !== -1) {
            const u = skipSpaces(titleEnd, e);
            if (u >= e || buf.charCodeAt(u) === 10) {
                defTitle = partEnd > partStart ? decodeText(partStart, partEnd) : null;
                return u;
            }
        }
    }
    const u = skipSpaces(q, e);
    if (u >= e || buf.charCodeAt(u) === 10) {
        return u;
    }
    return -1;
}

// ---------------------------------------------------------------------------------------------------------
// Inline phase
// ---------------------------------------------------------------------------------------------------------
// delimiter stack
const dNode: number[] = [];
const dCh: number[] = [];
const dNum: number[] = [];
const dOpen: boolean[] = [];
const dClose: boolean[] = [];
const dPrev: number[] = [];
const dNext: number[] = [];
let dN = 0;
let dLast = -1;
// bracket stack
const brNode: number[] = [];
const brImage: boolean[] = [];
const brActive: boolean[] = [];
const brDelim: number[] = [];
const brTextStart: number[] = [];
let brN = 0;
// inline note(^[) stack
const ntNode: number[] = [];
const ntDelim: number[] = [];
const ntBr: number[] = [];
let ntN = 0;

/**
 * Close the last inline note(^[) at `]` of `p`
 */
function closeNote(p: number): void {
    const i = --ntN;
    const opener = ntNode[i];
    const node = newNode(Footnote, nStart[opener], p + 1);
    moveBetween(opener, -1, node);
    insertAfter(opener, node);
    unlink(opener);
    resolveDelimiters(ntDelim[i]);
    if (brN > ntBr[i]) {
        brN = ntBr[i];
    }
}

function pushDelimiter(node: number, ch: number, num: number, canOpen: boolean, canClose: boolean): void {
    const i = dN++;
    dNode[i] = node;
    dCh[i] = ch;
    dNum[i] = num;
    dOpen[i] = canOpen;
    dClose[i] = canClose;
    dPrev[i] = dLast;
    dNext[i] = -1;
    if (dLast !== -1) {
        dNext[dLast] = i;
    }
    dLast = i;
}

function removeDelimiter(i: number): void {
    const prev = dPrev[i];
    const next = dNext[i];
    if (prev !== -1) {
        dNext[prev] = next;
    }
    if (next === -1) {
        dLast = prev;
    } else {
        dPrev[next] = prev;
    }
}

/** remove delimiters in (lo, hi) exclusive */
function removeDelimitersBetween(lo: number, hi: number): void {
    if (hi === -1) {
        dLast = lo;
        if (lo !== -1) {
            dNext[lo] = -1;
        }
        return;
    }
    dPrev[hi] = lo;
    if (lo !== -1) {
        dNext[lo] = hi;
    }
}

function firstDelimiterAfter(lo: number): number {
    if (lo !== -1) {
        return dNext[lo];
    }
    // first of the stack
    let i = dLast;
    if (i === -1) {
        return -1;
    }
    while (dPrev[i] !== -1) {
        i = dPrev[i];
    }
    return i;
}

/**
 * resolve `*` and `_` delimiters in (lo, hi) exclusive
 */
function resolveEmphasis(lo: number, hi: number): void {
    let bottomAsterisk = lo;
    let bottomUnderscore = lo;
    let closer = firstDelimiterAfter(lo);
    while (closer !== -1 && closer !== hi) {
        const ch = dCh[closer];
        if (ch === 126 || !dClose[closer]) {
            closer = dNext[closer];
            continue;
        }
        const bottom = ch === 42 ? bottomAsterisk : bottomUnderscore;
        let opener = dPrev[closer];
        let found = false;
        let candidate = false;
        while (opener !== -1 && opener !== lo && opener !== bottom) {
            if (dCh[opener] === ch && dOpen[opener]) {
                candidate = true;
                if (
                    !(
                        (dClose[opener] || dOpen[closer]) &&
                        dNum[closer] % 3 !== 0 &&
                        (dNum[opener] + dNum[closer]) % 3 === 0
                    )
                ) {
                    found = true;
                    break;
                }
            }
            opener = dPrev[opener];
        }
        if (found) {
            const use = dNum[closer] >= 2 && dNum[opener] >= 2 ? 2 : 1;
            const on = dNode[opener];
            const cn = dNode[closer];
            dNum[opener] -= use;
            dNum[closer] -= use;
            nEnd[on] -= use;
            nStart[cn] += use;
            const emphasis = newNode(use === 1 ? Emphasis : Strong, nEnd[on], nStart[cn]);
            moveBetween(on, cn, emphasis);
            insertAfter(on, emphasis);
            removeDelimitersBetween(opener, closer);
            if (dNum[opener] === 0) {
                unlink(on);
                if (bottomAsterisk === opener) {
                    bottomAsterisk = dPrev[opener];
                }
                if (bottomUnderscore === opener) {
                    bottomUnderscore = dPrev[opener];
                }
                removeDelimiter(opener);
            }
            if (dNum[closer] === 0) {
                unlink(cn);
                const next = dNext[closer];
                removeDelimiter(closer);
                closer = next;
            }
        } else {
            const old = closer;
            closer = dNext[closer];
            if (!candidate) {
                // no opener for this character below here
                if (ch === 42) {
                    bottomAsterisk = dPrev[old];
                } else {
                    bottomUnderscore = dPrev[old];
                }
            }
            if (!dOpen[old]) {
                if (bottomAsterisk === old) {
                    bottomAsterisk = dPrev[old];
                }
                if (bottomUnderscore === old) {
                    bottomUnderscore = dPrev[old];
                }
                removeDelimiter(old);
            }
        }
    }
    removeDelimitersBetween(lo, hi);
}

/**
 * resolve delimiters above `bottom`: strikethrough first, then emphasis
 */
function resolveDelimiters(bottom: number): void {
    let closer = firstDelimiterAfter(bottom);
    while (closer !== -1) {
        if (dCh[closer] === 126 && dClose[closer]) {
            let opener = dPrev[closer];
            while (opener !== -1 && opener !== bottom) {
                if (dCh[opener] === 126 && dOpen[opener] && dNum[opener] === dNum[closer]) {
                    break;
                }
                opener = dPrev[opener];
            }
            if (opener !== -1 && opener !== bottom) {
                resolveEmphasis(opener, closer);
                const on = dNode[opener];
                const cn = dNode[closer];
                const node = newNode(Delete, nStart[on], nEnd[cn]);
                moveBetween(on, cn, node);
                insertAfter(on, node);
                unlink(on);
                unlink(cn);
                const next = dNext[closer];
                removeDelimiter(opener);
                removeDelimiter(closer);
                closer = next;
                continue;
            }
        }
        closer = dNext[closer];
    }
    resolveEmphasis(bottom, -1);
}

/** text content of children for `alt` */
function textOfChildren(node: number): string {
    let out = "";
    for (let c = nFirst[node]; c !== -1; c = nNext[c]) {
        switch (nKind[c]) {
            case Str:
                out += decodeText(nStart[c], nEnd[c]);
                break;
            case Code:
            case Html:
                out += side[nA[c]] as string;
                break;
            case Image:
                out += side[nC[c]] as string;
                break;
            case ImageReference:
                out += side[nD[c]] as string;
                break;
            case Break:
            case FootnoteReference:
                break;
            default:
                out += textOfChildren(c);
        }
    }
    return out;
}

// eslint-disable-next-line no-control-regex -- control characters are not allowed in autolink
const RE_AUTOLINK = /^<([A-Za-z][A-Za-z0-9+.-]{1,31}:[^\s<>\x00-\x20\x7f]*)>/;
const RE_EMAIL_AUTOLINK =
    /^<([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
const TAG_NAME = "[A-Za-z][A-Za-z0-9-]*";
const INLINE_ATTRIBUTE = `(?:\\s+[A-Za-z_:][A-Za-z0-9_.:-]*(?:\\s*=\\s*(?:[^ \\t\\n"'=<>\`]+|'[^']*'|"[^"]*"))?)`;
const RE_HTML_INLINE = new RegExp(
    `^(?:<${TAG_NAME}${INLINE_ATTRIBUTE}*\\s*/?>|</${TAG_NAME}\\s*>|<!-->|<!--->|<!--[\\s\\S]*?-->|<\\?[\\s\\S]*?\\?>|<![A-Za-z][^>]*>|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>)`
);

// GFM autolink literal
let literalEnd = 0;

/** domain of www/protocol autolink. @returns end, or -1 */
function scanLiteralDomain(p: number, e: number): number {
    let i = p;
    let underscoreInLastSegment = false;
    let underscoreInLastLastSegment = false;
    let seen = false;
    while (i < e) {
        const c = buf.charCodeAt(i);
        if (c === 46 || c === 95) {
            // trailing punctuation?
            if (isLiteralTrail(i, e)) {
                break;
            }
            if (c === 95) {
                underscoreInLastSegment = true;
            } else {
                underscoreInLastLastSegment = underscoreInLastSegment;
                underscoreInLastSegment = false;
            }
            i++;
            continue;
        }
        const k = classify(c);
        if (k === 1 || (c !== 45 && k === 2)) {
            break;
        }
        seen = true;
        i++;
    }
    if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) {
        return -1;
    }
    return i;
}

/** path of www/protocol autolink. @returns end */
function scanLiteralPath(p: number, e: number): number {
    let i = p;
    let sizeOpen = 0;
    let sizeClose = 0;
    while (i < e) {
        const c = buf.charCodeAt(i);
        if (c === 40) {
            sizeOpen++;
            i++;
            continue;
        }
        if (c === 41 && sizeClose < sizeOpen) {
            sizeClose++;
            i++;
            continue;
        }
        if (
            c === 33 ||
            c === 34 ||
            c === 38 ||
            c === 39 ||
            c === 41 ||
            c === 42 ||
            c === 44 ||
            c === 46 ||
            c === 58 ||
            c === 59 ||
            c === 60 ||
            c === 63 ||
            c === 93 ||
            c === 95 ||
            c === 126
        ) {
            if (isLiteralTrail(i, e)) {
                break;
            }
            if (c === 41) {
                sizeClose++;
            }
            i++;
            continue;
        }
        if (classify(c) === 1) {
            break;
        }
        i++;
    }
    return i;
}

/** whether [p, ...) is trailing punctuations followed by an end */
function isLiteralTrail(p: number, e: number): boolean {
    let i = p;
    while (i < e) {
        const c = buf.charCodeAt(i);
        if (
            c === 33 ||
            c === 34 ||
            c === 39 ||
            c === 41 ||
            c === 42 ||
            c === 44 ||
            c === 46 ||
            c === 58 ||
            c === 59 ||
            c === 63 ||
            c === 95 ||
            c === 126
        ) {
            i++;
            continue;
        }
        if (c === 38) {
            // `&` + alphabeticals + `;`
            let j = i + 1;
            if (j >= e || !isAlpha(buf.charCodeAt(j))) {
                return false;
            }
            while (j < e && isAlpha(buf.charCodeAt(j))) {
                j++;
            }
            if (j >= e || buf.charCodeAt(j) !== 59) {
                return false;
            }
            i = j + 1;
            continue;
        }
        if (c === 93) {
            i++;
            if (i >= e) {
                return true;
            }
            const d = buf.charCodeAt(i);
            if (d === 40 || d === 91 || classify(d) === 1) {
                return true;
            }
            continue;
        }
        return c === 60 || classify(c) === 1;
    }
    return true;
}

/** `www.` autolink at p. @returns end, or -1 */
function scanWwwAutolink(p: number, e: number): number {
    if (p + 4 > e) {
        return -1;
    }
    const c1 = buf.charCodeAt(p + 1);
    const c2 = buf.charCodeAt(p + 2);
    if ((c1 !== 119 && c1 !== 87) || (c2 !== 119 && c2 !== 87) || buf.charCodeAt(p + 3) !== 46 || p + 4 >= e) {
        return -1;
    }
    const d = scanLiteralDomain(p, e);
    if (d === -1) {
        return -1;
    }
    return scanLiteralPath(d, e);
}

/** `http://` or `https://` autolink at p. @returns end, or -1 */
function scanProtocolAutolink(p: number, e: number): number {
    let i = p + 1;
    const t1 = buf.charCodeAt(i) | 32;
    const t2 = buf.charCodeAt(i + 1) | 32;
    const t3 = buf.charCodeAt(i + 2) | 32;
    if (t1 !== 116 || t2 !== 116 || t3 !== 112) {
        return -1;
    }
    i += 3;
    if ((buf.charCodeAt(i) | 32) === 115) {
        i++;
    }
    if (buf.charCodeAt(i) !== 58 || buf.charCodeAt(i + 1) !== 47 || buf.charCodeAt(i + 2) !== 47) {
        return -1;
    }
    i += 3;
    if (i >= e) {
        return -1;
    }
    const c = buf.charCodeAt(i);
    if (c < 32 || c === 127 || classify(c) !== 0) {
        return -1;
    }
    const d = scanLiteralDomain(i, e);
    if (d === -1) {
        return -1;
    }
    return scanLiteralPath(d, e);
}

/**
 * find the next email autolink candidate from p.
 * @returns start position, or MAX. The end is `literalEnd`
 */
function findEmail(p: number, s0: number, e: number): number {
    let at = p;
    for (;;) {
        at = buf.indexOf("@", at);
        if (at === -1 || at >= e) {
            return 0x7fffffff;
        }
        let s = at;
        while (s > p && isAtext(buf.charCodeAt(s - 1))) {
            s--;
        }
        if (s < at && !(s > s0 && (buf.charCodeAt(s - 1) === 47 || (s === p && isAtext(buf.charCodeAt(s - 1)))))) {
            // domain
            let i = at + 1;
            let dot = false;
            let data = false;
            while (i < e) {
                const c = buf.charCodeAt(i);
                if (c === 46) {
                    if (i + 1 < e && isAlnum(buf.charCodeAt(i + 1))) {
                        dot = true;
                        i++;
                        continue;
                    }
                    break;
                }
                if (c === 45 || c === 95 || isAlnum(c)) {
                    data = true;
                    i++;
                    continue;
                }
                break;
            }
            if (data && dot && isAlpha(buf.charCodeAt(i - 1))) {
                literalEnd = i;
                return s;
            }
        }
        at++;
    }
}

let atCache = -1;

/** cached `findEmail` for single line buffer(`src`): avoid to scan the whole source for each block */
function nextEmail(p: number, s0: number, e: number): number {
    if (!bMulti) {
        if (atCache !== -2 && atCache < p) {
            const at = src.indexOf("@", p);
            atCache = at === -1 ? -2 : at;
        }
        if (atCache === -2 || atCache >= e) {
            return 0x7fffffff;
        }
    }
    return findEmail(p, s0, e);
}

/** whether the tab at the offset is 1 column width */
function isSingleColumnTab(offset: number): boolean {
    let column = 0;
    for (let i = LS[lineOf(offset)]; i < offset; i++) {
        column += src.charCodeAt(i) === 9 ? 4 - (column % 4) : 1;
    }
    return column % 4 === 3;
}

function addText(parent: number, s: number, e: number, complex: boolean): number {
    const node = newNode(Str, s, e);
    nA[node] = complex ? 1 : 0;
    append(parent, node);
    return node;
}

/**
 * parse inline content of the block
 */
function parseInline(block: number, kind: number): void {
    const count = nD[block];
    if (count <= 0) {
        return;
    }
    setupBuf(nC[block], count, true);
    const s0 = bStart;
    const e = bEnd;
    let p = s0;
    if (p >= e) {
        return;
    }
    dN = 0;
    dLast = -1;
    brN = 0;
    ntN = 0;
    let textStart = p;
    let complex = false;
    let forcedStart = -1;
    let checkboxText = -1;
    let noCodeCloser = 0;
    const inTable = kind === TableCell;

    // task list item
    if (kind === Paragraph && buf.charCodeAt(p) === 91 && buf.charCodeAt(p + 2) === 93 && p + 3 < e) {
        const item = nParent[block];
        if (nKind[item] === ListItem && nFirst[item] === block) {
            const c = buf.charCodeAt(p + 1);
            const d = buf.charCodeAt(p + 3);
            if (
                (c === 32 || c === 10 || c === 120 || c === 88 || (c === 9 && isSingleColumnTab(mapPos(p + 1)))) &&
                (d === 32 || d === 9 || d === 10)
            ) {
                nA[item] = c === 120 || c === 88 ? 1 : 0;
                // micromark compatible: the first character of the text after the checkbox is removed
                let j = p + 3;
                let tab = false;
                while (j < e && (buf.charCodeAt(j) === 32 || buf.charCodeAt(j) === 9)) {
                    if (buf.charCodeAt(j) === 9) {
                        tab = true;
                    }
                    j++;
                }
                if (buf.charCodeAt(j) === 10 && j < e) {
                    if (j - (p + 3) >= 2 && !tab) {
                        // hard break follows the checkbox
                        p += 3;
                    } else {
                        // whitespaces before the line ending are not text: the line ending is removed
                        p = j + 1;
                        checkboxText = p;
                        forcedStart = segE[bSeg0 + vLineOf(j)] + 1;
                    }
                } else {
                    p += 4;
                    checkboxText = p;
                }
                textStart = p;
            }
        }
    }

    let emailStart = nextEmail(p, s0, e);
    while (p < e) {
        if (p > emailStart) {
            emailStart = nextEmail(p, s0, e);
        }
        const stop = emailStart < e ? emailStart : e;
        let c = 0;
        while (p < stop) {
            c = buf.charCodeAt(p);
            if (c < 128 && SPECIAL[c] === 1) {
                break;
            }
            p++;
        }
        if (p >= e) {
            break;
        }
        if (p === emailStart) {
            if (brN === 0) {
                if (p > textStart) {
                    addText(block, textStart, p, complex);
                    complex = false;
                }
                const link = newNode(Link, p, literalEnd);
                nA[link] = addSide(`mailto:${buf.slice(p, literalEnd)}`);
                append(block, link);
                append(link, newNode(Str, p, literalEnd));
                nA[nLast[link]] = 0;
                p = literalEnd;
                textStart = p;
                emailStart = nextEmail(p, s0, e);
                continue;
            }
            // not allowed in link text: skip this candidate
            const at = buf.indexOf("@", p);
            emailStart = nextEmail(at + 1, s0, e);
            continue;
        }
        switch (c) {
            case 10: {
                // line ending
                let ws = 0;
                let tab = false;
                while (p - ws > textStart) {
                    const d = buf.charCodeAt(p - ws - 1);
                    if (d === 9) {
                        tab = true;
                    } else if (d !== 32) {
                        break;
                    }
                    ws++;
                }
                if (ws >= 2 && !tab) {
                    if (p - ws > textStart) {
                        addText(block, textStart, p - ws, complex);
                        complex = false;
                    }
                    append(block, newNode(Break, p - ws, p + 1));
                    p++;
                    textStart = p;
                } else {
                    if (p - ws === textStart) {
                        // whitespaces only: text starts from the line ending
                        textStart = p;
                    }
                    complex = true;
                    p++;
                }
                break;
            }
            case 92: {
                // backslash
                const d = buf.charCodeAt(p + 1);
                if (p + 1 < e) {
                    if (d === 10) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        append(block, newNode(Break, p, p + 2));
                        p += 2;
                        textStart = p;
                        break;
                    }
                    if (d < 128 && ASCII_PUNCT[d] === 1) {
                        complex = true;
                        p += 2;
                        break;
                    }
                }
                p++;
                break;
            }
            case 38: {
                // &
                const end = entityAt(buf, p, e);
                if (end !== -1) {
                    complex = true;
                    p = end;
                } else {
                    p++;
                }
                break;
            }
            case 96: {
                // `
                let q = p;
                while (q < e && buf.charCodeAt(q) === 96) {
                    q++;
                }
                const size = q - p;
                let closeStart = -1;
                let closeEnd = -1;
                if (size > 30 || (noCodeCloser & (1 << size)) === 0) {
                    let i = q;
                    while (i < e) {
                        i = buf.indexOf("`", i);
                        if (i === -1 || i >= e) {
                            break;
                        }
                        let j = i;
                        while (j < e && buf.charCodeAt(j) === 96) {
                            j++;
                        }
                        if (j - i === size) {
                            closeStart = i;
                            closeEnd = j;
                            break;
                        }
                        i = j;
                    }
                    if (closeStart === -1 && size <= 30) {
                        noCodeCloser |= 1 << size;
                    }
                }
                if (closeStart === -1) {
                    p = q;
                    break;
                }
                if (p > textStart) {
                    addText(block, textStart, p, complex);
                    complex = false;
                }
                let value = sliceBufWithIndent(q, closeStart, 0);
                const n = value.length;
                if (n > 1) {
                    const head = value.charCodeAt(0);
                    const tail = value.charCodeAt(n - 1);
                    if ((head === 32 || head === 10 || head === 13) && (tail === 32 || tail === 10 || tail === 13)) {
                        let data = false;
                        for (let i = 1; i < n - 1; i++) {
                            const d = value.charCodeAt(i);
                            if (d !== 32 && d !== 10 && d !== 13) {
                                data = true;
                                break;
                            }
                        }
                        if (data) {
                            const hs = head === 13 && value.charCodeAt(1) === 10 ? 2 : 1;
                            const ts = tail === 10 && value.charCodeAt(n - 2) === 13 ? 2 : 1;
                            value = value.slice(hs, n - ts);
                        }
                    }
                }
                if (inTable && value.indexOf("\\") !== -1) {
                    value = value.replace(/\\\|/g, "|");
                }
                const node = newNode(Code, p, closeEnd);
                nA[node] = addSide(value);
                append(block, node);
                p = closeEnd;
                textStart = p;
                break;
            }
            case 60: {
                // <
                const rest = bMulti ? (p === 0 ? buf : buf.slice(p)) : buf.slice(p, e);
                const next = buf.charCodeAt(p + 1);
                let m: RegExpExecArray | null = null;
                if (isAlpha(next)) {
                    m = RE_AUTOLINK.exec(rest);
                    let email = false;
                    if (m === null) {
                        m = RE_EMAIL_AUTOLINK.exec(rest);
                        email = m !== null;
                    }
                    if (m !== null) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        const end = p + m[0].length;
                        const link = newNode(Link, p, end);
                        nA[link] = addSide(email ? `mailto:${m[1]}` : m[1]);
                        append(block, link);
                        const text = newNode(Str, p + 1, end - 1);
                        nA[text] = 0;
                        append(link, text);
                        p = end;
                        textStart = p;
                        break;
                    }
                } else if (next !== 60 && next !== 62 && next !== 64 && next > 32) {
                    m = RE_EMAIL_AUTOLINK.exec(rest);
                    if (m !== null) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        const end = p + m[0].length;
                        const link = newNode(Link, p, end);
                        nA[link] = addSide(`mailto:${m[1]}`);
                        append(block, link);
                        const text = newNode(Str, p + 1, end - 1);
                        nA[text] = 0;
                        append(link, text);
                        p = end;
                        textStart = p;
                        break;
                    }
                }
                if (isAlpha(next) || next === 47 || next === 33 || next === 63) {
                    m = RE_HTML_INLINE.exec(rest);
                    if (m !== null && p + m[0].length <= e) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        const end = p + m[0].length;
                        const node = newNode(Html, p, end);
                        nA[node] = addSide(sliceBufWithIndent(p, end, 3));
                        append(block, node);
                        p = end;
                        textStart = p;
                        break;
                    }
                }
                p++;
                break;
            }
            case 42:
            case 95: {
                // * or _
                let q = p + 1;
                while (q < e && buf.charCodeAt(q) === c) {
                    q++;
                }
                const prev = p > s0 ? buf.charCodeAt(p - 1) : -1;
                const next = q < e ? buf.charCodeAt(q) : -1;
                const before = classify(prev);
                const after = classify(next);
                const open = after === 0 || (after === 2 && before !== 0) || next === 126 || next === 42 || next === 95;
                const close =
                    before === 0 || (before === 2 && after !== 0) || prev === 126 || prev === 42 || prev === 95;
                const canOpen = c === 42 ? open : open && (before !== 0 || !close);
                const canClose = c === 42 ? close : close && (after !== 0 || !open);
                if (canOpen || canClose) {
                    if (p > textStart) {
                        addText(block, textStart, p, complex);
                        complex = false;
                    }
                    pushDelimiter(addText(block, p, q, false), c, q - p, canOpen, canClose);
                    textStart = q;
                }
                p = q;
                break;
            }
            case 126: {
                // ~
                let q = p + 1;
                while (q < e && buf.charCodeAt(q) === 126) {
                    q++;
                }
                if (q - p <= 2) {
                    const prev = p > s0 ? buf.charCodeAt(p - 1) : -1;
                    const next = q < e ? buf.charCodeAt(q) : -1;
                    const before = classify(prev);
                    const after = classify(next);
                    const canOpen = after === 0 || (after === 2 && before !== 0);
                    const canClose = before === 0 || (before === 2 && after !== 0);
                    if (canOpen || canClose) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        pushDelimiter(addText(block, p, q, false), 126, q - p, canOpen, canClose);
                        textStart = q;
                    }
                }
                p = q;
                break;
            }
            case 94: {
                // ^[ : start of inline note
                if (buf.charCodeAt(p + 1) === 91 && p + 1 < e) {
                    if (p > textStart) {
                        addText(block, textStart, p, complex);
                        complex = false;
                    }
                    const i = ntN++;
                    ntNode[i] = addText(block, p, p + 2, false);
                    ntDelim[i] = dLast;
                    ntBr[i] = brN;
                    p += 2;
                    textStart = p;
                } else {
                    p++;
                }
                break;
            }
            case 33: {
                // !
                if (buf.charCodeAt(p + 1) === 91 && p + 1 < e && buf.charCodeAt(p + 2) !== 94) {
                    if (p > textStart) {
                        addText(block, textStart, p, complex);
                        complex = false;
                    }
                    const i = brN++;
                    brNode[i] = addText(block, p, p + 2, false);
                    brImage[i] = true;
                    brActive[i] = true;
                    brDelim[i] = dLast;
                    brTextStart[i] = p + 2;
                    p += 2;
                    textStart = p;
                } else {
                    p++;
                }
                break;
            }
            case 91: {
                // [
                if (buf.charCodeAt(p + 1) === 94 && footnotes.size > 0) {
                    // footnote reference
                    let j = p + 2;
                    while (j < e) {
                        const d = buf.charCodeAt(j);
                        if (d === 93 || d === 91) {
                            break;
                        }
                        if (d === 92 && j + 1 < e) {
                            const f = buf.charCodeAt(j + 1);
                            if (f === 91 || f === 92 || f === 93) {
                                j++;
                            }
                        }
                        j++;
                    }
                    if (j < e && j > p + 2 && buf.charCodeAt(j) === 93) {
                        const label = buf.slice(p + 2, j);
                        if (footnotes.has(normalizeIdentifier(label))) {
                            if (p > textStart) {
                                addText(block, textStart, p, complex);
                                complex = false;
                            }
                            const node = newNode(FootnoteReference, p, j + 1);
                            nA[node] = addSide(normalizeIdentifier(label).toLowerCase());
                            nB[node] = addSide(decodeString(label));
                            append(block, node);
                            p = j + 1;
                            textStart = p;
                            break;
                        }
                    }
                }
                if (buf.charCodeAt(p + 1) === 94 && p + 1 < e) {
                    // remark-footnotes compatible: `[^` is not a start of link
                    p++;
                    break;
                }
                if (p > textStart) {
                    addText(block, textStart, p, complex);
                    complex = false;
                }
                const i = brN++;
                brNode[i] = addText(block, p, p + 1, false);
                brImage[i] = false;
                brActive[i] = true;
                brDelim[i] = dLast;
                brTextStart[i] = p + 1;
                p++;
                textStart = p;
                break;
            }
            case 93: {
                // ]
                if (brN === 0) {
                    if (ntN > 0) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        closeNote(p);
                        p++;
                        textStart = p;
                    } else {
                        p++;
                    }
                    break;
                }
                const opener = brN - 1;
                if (!brActive[opener]) {
                    brN--;
                    if (ntN > 0) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        closeNote(p);
                        p++;
                        textStart = p;
                    } else {
                        p++;
                    }
                    break;
                }
                const isImage = brImage[opener];
                const labelText = buf.slice(brTextStart[opener], p);
                const defined = definitions.size > 0 && definitions.has(normalizeIdentifier(labelText));
                const next = p + 1 < e ? buf.charCodeAt(p + 1) : -1;
                let end = -1;
                let url: string | null = null;
                let title: string | null = null;
                let referenceType = -1;
                let referenceLabel = labelText;
                if (next === 40) {
                    // resource
                    let q = skipWhitespace(p + 2, e);
                    if (q < e && buf.charCodeAt(q) === 41) {
                        url = "";
                        end = q + 1;
                    } else {
                        const d = scanDestination(q, e);
                        if (d !== -1) {
                            const ds = partStart;
                            const de = partEnd;
                            q = skipWhitespace(d, e);
                            if (q < e && buf.charCodeAt(q) === 41) {
                                url = decodeString(buf.slice(ds, de));
                                end = q + 1;
                            } else if (q > d) {
                                const t = scanTitle(q, e);
                                if (t !== -1) {
                                    const ts = partStart;
                                    const te = partEnd;
                                    q = skipWhitespace(t, e);
                                    if (q < e && buf.charCodeAt(q) === 41) {
                                        url = decodeString(buf.slice(ds, de));
                                        title = te > ts ? decodeText(ts, te) : null;
                                        end = q + 1;
                                    }
                                }
                            }
                        }
                    }
                    if (end === -1 && defined) {
                        referenceType = 0;
                        end = p + 1;
                    }
                } else if (next === 91) {
                    const labelEnd = definitions.size > 0 ? scanLabel(p + 1, e) : -1;
                    if (labelEnd !== -1 && definitions.has(normalizeIdentifier(buf.slice(p + 2, labelEnd)))) {
                        referenceType = 2;
                        referenceLabel = buf.slice(p + 2, labelEnd);
                        end = labelEnd + 1;
                    } else if (defined && buf.charCodeAt(p + 2) === 93 && p + 2 < e) {
                        referenceType = 1;
                        end = p + 3;
                    }
                } else if (defined) {
                    referenceType = 0;
                    end = p + 1;
                }
                if (end === -1) {
                    brN--;
                    if (ntN > 0) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        closeNote(p);
                        p++;
                        textStart = p;
                    } else {
                        p++;
                    }
                    break;
                }
                if (p > textStart) {
                    addText(block, textStart, p, complex);
                    complex = false;
                }
                const bracket = brNode[opener];
                const node = newNode(
                    referenceType === -1 ? (isImage ? Image : Link) : isImage ? ImageReference : LinkReference,
                    nStart[bracket],
                    end
                );
                moveBetween(bracket, -1, node);
                insertAfter(bracket, node);
                unlink(bracket);
                resolveDelimiters(brDelim[opener]);
                if (referenceType === -1) {
                    nA[node] = addSide(url);
                    nB[node] = title === null ? -1 : addSide(title);
                    if (isImage) {
                        nC[node] = addSide(textOfChildren(node));
                    }
                } else {
                    nA[node] = addSide(normalizeIdentifier(referenceLabel).toLowerCase());
                    nB[node] = addSide(decodeString(referenceLabel));
                    nC[node] = referenceType;
                    if (isImage) {
                        nD[node] = addSide(textOfChildren(node));
                    }
                }
                if (isImage) {
                    nFirst[node] = -1;
                    nLast[node] = -1;
                } else {
                    // links can not contain links
                    for (let i = 0; i < opener; i++) {
                        if (!brImage[i]) {
                            brActive[i] = false;
                        }
                    }
                }
                brN = opener;
                // unclosed inline notes in the link text are just text
                while (ntN > 0 && ntBr[ntN - 1] > opener) {
                    ntN--;
                }
                p = end;
                textStart = p;
                break;
            }
            default: {
                // h, H, w, W: GFM autolink literal
                if (brN === 0) {
                    const prev = p > s0 ? buf.charCodeAt(p - 1) : -1;
                    let end = -1;
                    let www = false;
                    if (c === 119 || c === 87) {
                        if (
                            prev === -1 ||
                            prev === 40 ||
                            prev === 42 ||
                            prev === 95 ||
                            prev === 91 ||
                            prev === 93 ||
                            prev === 126 ||
                            prev === 32 ||
                            prev === 9 ||
                            prev === 10
                        ) {
                            end = scanWwwAutolink(p, e);
                            www = true;
                        }
                    } else if (prev === -1 || !isAlpha(prev)) {
                        end = scanProtocolAutolink(p, e);
                    }
                    if (end !== -1) {
                        if (p > textStart) {
                            addText(block, textStart, p, complex);
                            complex = false;
                        }
                        const link = newNode(Link, p, end);
                        const value = buf.slice(p, end);
                        nA[link] = addSide(www ? `http://${value}` : value);
                        append(block, link);
                        const text = newNode(Str, p, end);
                        nA[text] = 0;
                        append(link, text);
                        p = end;
                        textStart = p;
                        break;
                    }
                }
                p++;
            }
        }
    }
    if (e > textStart) {
        addText(block, textStart, e, complex);
    }
    resolveDelimiters(-1);
    finishInline(block);

    if (checkboxText !== -1) {
        // The paragraph starts from the text after checkbox if the text is not only a whitespace
        const first = nFirst[block];
        if (first !== -1 && nKind[first] === Str && nC[first] === checkboxText) {
            if (forcedStart !== -1) {
                nStart[first] = forcedStart;
            }
            nStart[block] = nStart[first];
        }
    }
}

/**
 * merge adjacent Str, compute value of Str, and convert positions to offsets of `src`
 */
function finishInline(parent: number): void {
    let c = nFirst[parent];
    while (c !== -1) {
        const kind = nKind[c];
        if (kind === Str) {
            let next = nNext[c];
            let complex = nA[c] === 1;
            while (next !== -1 && nKind[next] === Str) {
                nEnd[c] = nEnd[next];
                complex = complex || nA[next] === 1;
                const after = nNext[next];
                unlink(next);
                next = after;
            }
            const s = nStart[c];
            const e = nEnd[c];
            // keep the position in `buf` for checkbox
            nC[c] = s;
            if (complex) {
                nA[c] = addSide(decodeText(s, e));
            } else if (bMulti) {
                nA[c] = addSide(buf.slice(s, e));
            } else {
                nA[c] = -1;
            }
            nStart[c] = mapPos(s);
            nEnd[c] = mapEnd(e);
            c = next;
            continue;
        }
        if (kind === Break) {
            nStart[c] = mapPos(nStart[c]);
            nEnd[c] = mapEnd(nEnd[c]);
        } else {
            nStart[c] = mapPos(nStart[c]);
            nEnd[c] = mapPos(nEnd[c]);
            if (nFirst[c] !== -1) {
                finishInline(c);
            }
        }
        c = nNext[c];
    }
}

function parseInlines(): void {
    const n = nCount;
    for (let i = 1; i < n; i++) {
        const kind = nKind[i];
        if (kind === Paragraph || kind === Header || kind === TableCell) {
            parseInline(i, kind);
        }
    }
}

// ---------------------------------------------------------------------------------------------------------
// Emit phase
// ---------------------------------------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyNode = any;

function emitChildren(node: number): AnyNode[] {
    const children: AnyNode[] = [];
    for (let c = nFirst[node]; c !== -1; c = nNext[c]) {
        children.push(emit(c));
    }
    return children;
}

function emit(i: number): AnyNode {
    const kind = nKind[i];
    const s = nStart[i];
    const e = nEnd[i];
    const startLine = lineOf(s);
    const startColumn = s - LS[startLine];
    // children are emitted before end position to keep `lineOf` cache effective
    let children: AnyNode[] | undefined;
    if (
        kind <= TableCell &&
        kind !== CodeBlock &&
        kind !== HtmlBlock &&
        kind !== HorizontalRule &&
        kind !== Definition
    ) {
        children = emitChildren(i);
    } else if (kind >= Emphasis && kind <= Delete) {
        children = emitChildren(i);
    } else if (kind === Link || kind === LinkReference || kind === Footnote) {
        children = emitChildren(i);
    }
    const endLine = lineOf(e);
    const loc = {
        start: { line: startLine + 1, column: startColumn },
        end: { line: endLine + 1, column: e - LS[endLine] }
    };
    const range = [s, e] as const;
    const raw = src.slice(s, e);
    const type = TYPE_NAMES[kind];
    switch (kind) {
        case Str:
            return { type, value: nA[i] === -1 ? raw : side[nA[i]], loc, range, raw };
        case Paragraph:
        case BlockQuote:
        case Emphasis:
        case Strong:
        case Delete:
        case TableRow:
        case TableCell:
        case Document:
        case Footnote:
            return { type, children, loc, range, raw };
        case Header:
            return { type, depth: nA[i], children, loc, range, raw };
        case List:
            return {
                type,
                ordered: nA[i] === 1,
                start: nA[i] === 1 ? nB[i] : null,
                spread: nD[i] === 1,
                children,
                loc,
                range,
                raw
            };
        case ListItem:
            return { type, spread: nB[i] === 1, checked: nA[i] === -1 ? null : nA[i] === 1, children, loc, range, raw };
        case CodeBlock:
            return {
                type,
                lang: nA[i] === -1 ? null : side[nA[i]],
                meta: nB[i] === -1 ? null : side[nB[i]],
                value: side[nC[i]],
                loc,
                range,
                raw
            };
        case Code:
        case Html:
        case HtmlBlock:
        case Yaml:
        case Toml:
        case Json:
            return { type, value: side[nA[i]], loc, range, raw };
        case Break:
        case HorizontalRule:
            return { type, loc, range, raw };
        case Link:
            return { type, title: nB[i] === -1 ? null : side[nB[i]], url: side[nA[i]], children, loc, range, raw };
        case Image:
            return {
                type,
                title: nB[i] === -1 ? null : side[nB[i]],
                url: side[nA[i]],
                alt: side[nC[i]],
                loc,
                range,
                raw
            };
        case LinkReference:
            return {
                type,
                children,
                label: side[nB[i]],
                identifier: side[nA[i]],
                referenceType: REFERENCE_TYPES[nC[i]],
                loc,
                range,
                raw
            };
        case ImageReference:
            return {
                type,
                alt: side[nD[i]],
                label: side[nB[i]],
                identifier: side[nA[i]],
                referenceType: REFERENCE_TYPES[nC[i]],
                loc,
                range,
                raw
            };
        case Definition:
            return {
                type,
                identifier: side[nA[i]],
                label: side[nB[i]],
                title: nC[i] === -1 ? null : side[nC[i]],
                url: side[nD[i]],
                loc,
                range,
                raw
            };
        case FootnoteDefinition:
            return { type, identifier: side[nA[i]], label: side[nB[i]], children, loc, range, raw };
        case FootnoteReference:
            return { type, identifier: side[nA[i]], label: side[nB[i]], loc, range, raw };
        case Table:
            return { type, align: side[nA[i]], children, loc, range, raw };
    }
    throw new Error(`Unknown node kind: ${kind}`);
}

/**
 * Parse Markdown text to TxtAST.
 * `text` should not include BOM.
 */
export function parseMarkdown(text: string): TxtDocumentNode {
    src = text;
    len = text.length;
    hasCR = text.indexOf("\r") !== -1;
    nCount = 0;
    segN = 0;
    side = [];
    lineCache = 0;
    atCache = -1;
    if (definitions.size > 0) {
        definitions = new Set();
    }
    if (footnotes.size > 0) {
        footnotes = new Set();
    }
    try {
        buildLines();
        parseBlocks();
        parseInlines();
        lineCache = 0;
        return emit(0) as TxtDocumentNode;
    } finally {
        // release references
        src = "";
        buf = "";
        side = [];
    }
}
