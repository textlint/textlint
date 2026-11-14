import assert from "node:assert";
import { describe, it } from "vitest";
import { escapeHtml } from "../../src/helper/escape-html.js";

describe("escapeHtml", () => {
    it("escapes the characters of HTML", () => {
        assert.strictEqual(
            escapeHtml(`<a href="x">Tom & 'Jerry'</a>`),
            "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;"
        );
    });
    it("returns the text as it is when it has nothing to escape", () => {
        assert.strictEqual(escapeHtml("日本語 text"), "日本語 text");
        assert.strictEqual(escapeHtml(""), "");
    });
});
