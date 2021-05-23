import { fromYAML } from "prh";
import fs from "fs";
import path from "path";

export default function (text: string) {
    const dict = fs.readFileSync(path.join(__dirname, "prh.yml"), "utf-8");
    const engine = fromYAML("", dict);
    return engine.makeChangeSet("", text);
}
