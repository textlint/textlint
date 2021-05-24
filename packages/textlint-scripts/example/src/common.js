import path from "path";
import prh from "prh";
import fs from "fs";
export default function (text) {
    const dict = fs.readFileSync(path.join(__dirname, "prh.yml"), "utf-8");
    const engine = prh.fromYAML("", dict);
    return engine.makeChangeSet("", text);
}
