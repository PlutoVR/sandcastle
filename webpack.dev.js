const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');

const APP_DIR = path.resolve(__dirname, 'src/');
const BUILD_DIR = path.resolve(__dirname, 'dist/');

module.exports = merge(common, {
    devtool: "eval-source-map",
    devServer: {
        contentBase: path.join(APP_DIR, 'assets'),
        // writeToDisk: true,
        // host: '192.168.0.180',
        // disableHostCheck: true
        port: 1234,
    }
});