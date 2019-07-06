module.exports = {
    presets: [
        [
            "@babel/env",
            {
                // For async/await support
                // https://babeljs.io/docs/en/babel-preset-env#targetsesmodules
                targets: {
                    esmodules: true
                }
            }
        ]
    ],
    plugins: [
        // inline fs content
        "static-fs"
    ]
};
