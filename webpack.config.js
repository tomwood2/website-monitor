const path = require('path');

module.exports = {
    target: 'node',
    mode: "production",
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs'
    },
    node: {
        global: false,
        __filename: false,
        __dirname: false,
    },
    externals: [
        /^(?!\.|\/).+/i,
    ],
};
