// Generate test/cjk-friendly/cases.json with markdown-it-cjk-friendly, the implementation by the author of the
// CommonMark CJK-friendly Amendments that VitePress uses.
// Usage: node tools/create-cjk-friendly-fixture.mjs
// It needs markdown-it and markdown-it-cjk-friendly, which are not dependencies of this package:
// npm install --no-save markdown-it markdown-it-cjk-friendly
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import cjkFriendly from "markdown-it-cjk-friendly";

const md = MarkdownIt({ html: false, linkify: false }).use(cjkFriendly);
// Characters of the "Emphasis Marker Start/End Conditions" table of implementers-tips.md:
// whitespace, non-CJK punctuation, non-CJK character, CJK punctuation, CJK character
const chars = [" ", '"', "a", "～", "字"];
const markers = ["*", "**", "_", "__", "~~"];
const inputs = [];
for (const m of markers) {
    for (const outer1 of chars) {
        for (const inner1 of chars) {
            for (const inner2 of chars) {
                for (const outer2 of chars) {
                    inputs.push(`x${outer1}${m}${inner1}y${inner2}${m}${outer2}z`);
                }
            }
        }
    }
}
inputs.push(
    // Examples of the specification and its README
    "**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。",
    "**这些星号不会被识别为强调标记，而是就这么原样显示出来。**都是因为这个句子。",
    "**이 애스터리스크는 이 괄호(parenthesis)**가 있는 바람에 강조 기호로 인식되지 않고 그대로 표시됩니다.",
    "**強調。**この文",
    "~~削除。~~この文",
    "**東京：**は",
    "a**(b)**c",
    // Surrogate pairs: a CJK ideograph outside the BMP
    "**𠮷。**野家",
    "𠮷**「家」**です",
    // Variation selectors
    "**葛\u{E0100}**「城」",
    "「**葛\u{E0101}」**です",
    "**強調。︀**この文",
    "これは**“︁引用”︁**です",
    "これは**“引用”**です",
    "a **︀b**c",
    // Emoji are not CJK
    "**😀**の後",
    "これは**強調😀**です"
);
const cases = inputs.map((input) => ({ input, html: md.renderInline(input) }));
fs.writeFileSync(
    fileURLToPath(new URL("../test/cjk-friendly/cases.json", import.meta.url)),
    `${JSON.stringify(cases, null, 2)}\n`
);
