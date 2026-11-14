import { describe, it } from "vitest";
import assert from "node:assert";
import { MAY_HAVE_EMOJI_PATTERN, stringWidth } from "../../src/helper/string-width.js";

describe("stringWidth", () => {
    it("returns the number of the characters for ASCII", () => {
        assert.strictEqual(stringWidth(""), 0);
        assert.strictEqual(stringWidth("abc"), 3);
        assert.strictEqual(stringWidth("a b"), 3);
    });
    it("counts a fullwidth character as two columns", () => {
        assert.strictEqual(stringWidth("日本語"), 6);
        assert.strictEqual(stringWidth("ＡＢ"), 4);
        assert.strictEqual(stringWidth("한"), 2);
        assert.strictEqual(stringWidth("a日b"), 4);
        assert.strictEqual(stringWidth("𠮷"), 2);
    });
    it("counts an emoji as two columns", () => {
        assert.strictEqual(stringWidth("😀"), 2);
        assert.strictEqual(stringWidth("👨‍👩‍👧"), 2);
        assert.strictEqual(stringWidth("a😀b"), 4);
    });
    it("counts an emoji of the Basic Multilingual Plane as two columns", () => {
        assert.strictEqual(stringWidth("\u231A"), 2); // watch
        assert.strictEqual(stringWidth("\u00A9\uFE0F"), 2); // copyright sign as an emoji
        assert.strictEqual(stringWidth("#\uFE0F\u20E3"), 2); // keycap
        assert.strictEqual(stringWidth("\u3299\uFE0F"), 2); // circled ideograph secret
    });
    it("checks the emoji pattern for all emoji of a code point", () => {
        const emojiPattern = new RegExp("^\\p{RGI_Emoji}$", "v");
        for (let codePoint = 0; codePoint <= 0x10ffff; codePoint++) {
            const character = String.fromCodePoint(codePoint);
            if (emojiPattern.test(character)) {
                assert.ok(MAY_HAVE_EMOJI_PATTERN.test(character), `U+${codePoint.toString(16)}`);
            }
        }
    });
    it("ignores escape sequences", () => {
        assert.strictEqual(stringWidth("\u001B[31merror\u001B[39m"), 5);
        assert.strictEqual(stringWidth("\u001B]8;;https://example.com\u0007link\u001B]8;;\u0007"), 4);
    });
    it("ignores control characters and combining characters", () => {
        assert.strictEqual(stringWidth("a\tb\n"), 2);
        assert.strictEqual(stringWidth("é"), 1);
    });
});
