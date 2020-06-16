const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common");

const APP_DIR = path.resolve(__dirname, "src/");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  devServer: {
    contentBase: APP_DIR,
    hot: true,
    open: true,
    disableHostCheck: true,
    port: 1234,
  },
});
