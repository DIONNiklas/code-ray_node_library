const path = require("path");

module.exports = {
    entry: './src/index.ts',
    target: "node",
    mode: "production",
    output: {
        path: path.join(__dirname, "dist"),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        symlinks: false
    },
    optimization: {
        minimize: false
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader'
                },
            },
            {
                test: /\.jsx?/,
                exclude: '/node_modules/',
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ["@babel/plugin-proposal-class-properties"]
                    }
                }
            }
        ]
    }
};