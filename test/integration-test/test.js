const runLint = require("./run_lint");
const testList = [
    {
        name: "JavaScript-Plugin-Architecture",
        path: "ja/"
    }, {
        name: "gitbook-starter-kit",
        path: "ja/"
    },
    {
        name: "webpack-book",
        path: "manuscript/"
    },
    {
        name: "scala_text",
        path: "src/"
    },
    {
        name: "magi-hacker",
        path: "chapter-01/ chapter-02/ chapter-03/ chapter-04/ chapter-05/"
    }
];

testList.forEach((test) => {
    runLint(test.name, test.path);
});
