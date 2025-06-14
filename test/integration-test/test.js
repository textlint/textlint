import semver from "semver";
import runLint from "./run_lint.js";
const testList = [
    {
        name: "JavaScript-Plugin-Architecture",
        path: "ja/"
    },
    {
        name: "gitbook-starter-kit",
        path: "ja/"
    },
    {
        name: "webpack-book",
        path: "manuscript/",
        version: "6.0.0"
    },
    // TODO: break .textlintrc setting
    // {
    //     name: "scala_text",
    //     path: "src/"
    // },
    {
        name: "magi-hacker",
        path: "chapter-01/ chapter-02/ chapter-03/ chapter-04/ chapter-05/",
        version: "6.0.0"
    }
].filter((testTarget) => {
    const version = process.version;
    if (testTarget.version === undefined) {
        return true;
    }
    return semver.gte(version, testTarget.version);
});

testList.forEach((test) => {
    runLint(test.name, test.path);
});
