import path from "node:path";
import { fromYAML } from "prh";
import fs from "node:fs";
export default function (text) {
    const dict = fs.readFileSync(path.join(__dirname, "prh.yml"), "utf-8");
    const engine = fromYAML("", dict);
    return engine.makeChangeSet("", text);
}
