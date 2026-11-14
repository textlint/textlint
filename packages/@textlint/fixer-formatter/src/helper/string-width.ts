import { stripVTControlCharacters } from "node:util";

/**
 * `\p{RGI_Emoji}` is a large set of strings, and V8 takes about 15-20ms to parse the pattern.
 * So the pattern is created when a text that may have an emoji comes first. Most outputs never create it.
 *
 * Do not write it as a regular expression literal, even in a function:
 * V8 parses a literal when it parses the file, so only loading this file takes the time.
 */
const getEmojiPattern = (() => {
    // Only this function refers to the created pattern
    let emojiPattern: RegExp | undefined;
    return (): RegExp => {
        emojiPattern ??= new RegExp("\\p{RGI_Emoji}", "gv");
        return emojiPattern;
    };
})();
/**
 * A text that has an emoji matches this pattern. It is a cheap check before creating the emoji pattern.
 * Each emoji has one of them:
 *
 * - U+203C..U+2B55, U+3030, U+303D, U+3297, U+3299: the emoji of the Basic Multilingual Plane, and U+20E3 of a keycap
 * - U+FE0F: the variation selector of an emoji that is a text character by default, such as "\u00A9\uFE0F"
 * - U+D83C..U+D83E: the high surrogate of U+1F000..U+1FFFF
 */
export const MAY_HAVE_EMOJI_PATTERN = /[\u203c-\u2b55\u3030\u303d\u3297\u3299\ud83c-\ud83e]|\ufe0f/;

/**
 * Code points are derived from https://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
 */
const isFullwidthCodePoint = (codePoint: number): boolean => {
    return (
        codePoint >= 0x1100 &&
        (codePoint <= 0x115f || // Hangul Jamo
            codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
            codePoint === 0x232a || // RIGHT-POINTING ANGLE BRACKET
            // CJK Radicals Supplement .. Enclosed CJK Letters and Months
            (0x2e80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303f) ||
            // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
            (0x3250 <= codePoint && codePoint <= 0x4dbf) ||
            // CJK Unified Ideographs .. Yi Radicals
            (0x4e00 <= codePoint && codePoint <= 0xa4c6) ||
            // Hangul Jamo Extended-A
            (0xa960 <= codePoint && codePoint <= 0xa97c) ||
            // Hangul Syllables
            (0xac00 <= codePoint && codePoint <= 0xd7a3) ||
            // CJK Compatibility Ideographs
            (0xf900 <= codePoint && codePoint <= 0xfaff) ||
            // Vertical Forms
            (0xfe10 <= codePoint && codePoint <= 0xfe19) ||
            // CJK Compatibility Forms .. Small Form Variants
            (0xfe30 <= codePoint && codePoint <= 0xfe6b) ||
            // Halfwidth and Fullwidth Forms
            (0xff01 <= codePoint && codePoint <= 0xff60) ||
            (0xffe0 <= codePoint && codePoint <= 0xffe6) ||
            // Kana Supplement
            (0x1b000 <= codePoint && codePoint <= 0x1b001) ||
            // Enclosed Ideographic Supplement
            (0x1f200 <= codePoint && codePoint <= 0x1f251) ||
            // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
            (0x20000 <= codePoint && codePoint <= 0x3fffd))
    );
};

/**
 * Get the number of the columns that the string uses in a terminal.
 * It is based on https://github.com/sindresorhus/string-width v4
 *
 * Node.js has the same function internally, but it is not a public API yet.
 * Replace this file with the function of Node.js when it is available in the supported versions of Node.js.
 *
 * - An escape sequence, a control character and a combining character use no column
 * - A fullwidth character and an emoji use two columns
 */
export const stringWidth = (text: string): number => {
    if (text.length === 0) {
        return 0;
    }
    const strippedText = stripVTControlCharacters(text);
    const plainText = MAY_HAVE_EMOJI_PATTERN.test(strippedText)
        ? strippedText.replace(getEmojiPattern(), "  ")
        : strippedText;
    let width = 0;
    for (const character of plainText) {
        const codePoint = character.codePointAt(0)!;
        // Ignore control characters
        if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
            continue;
        }
        // Ignore combining characters
        if (codePoint >= 0x300 && codePoint <= 0x36f) {
            continue;
        }
        width += isFullwidthCodePoint(codePoint) ? 2 : 1;
    }
    return width;
};
