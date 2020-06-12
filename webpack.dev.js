const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');
const os = require('os');

const getLocalExternalIp = () => [].concat.apply([], Object.values(os.networkInterfaces()))
    .filter(details => details.family === 'IPv4' && !details.internal)
    .pop().address.toString();

const APP_DIR = path.resolve(__dirname, 'src/');

module.exports = merge(common, {
    mode: 'development',
    devtool: "eval-source-map",
    devServer: {
        contentBase: APP_DIR,
        // host: getLocalExternalIp(),
        // public: getLocalExternalIp(),
        // disableHostCheck: true,
        port: 1234
    }
});