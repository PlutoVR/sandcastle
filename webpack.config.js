const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const APP_DIR = path.resolve(__dirname, 'src/');
const BUILD_DIR = path.resolve(__dirname, 'dist/');

module.exports = {
    entry: APP_DIR + '/index.js',
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js',
        // publicPath: '/'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            // {
            //     test: /\.worker\.js$/,
            //     use: { loader: 'worker-loader' }
            // },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            }
        ]
    },
    watchOptions: {
        ignored: /node_modules/
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        }),
        // new BundleAnalyzerPlugin()
    ],
    resolve: {
        extensions: ['.js', '.es6'],
    },
    devServer: {
        contentBase: path.join(APP_DIR, 'assets'),
        // writeToDisk: true,
        // host: '192.168.0.180',
        // disableHostCheck: true
        port: 1234,
    }
};