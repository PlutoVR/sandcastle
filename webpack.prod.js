const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');

const APP_DIR = path.resolve(__dirname, 'src/');
const BUILD_DIR = path.resolve(__dirname, 'dist/');

module.exports = merge(common, {

});