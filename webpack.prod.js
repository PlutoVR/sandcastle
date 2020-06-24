const merge = require("webpack-merge");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const imageminMozjpeg = require("imagemin-mozjpeg");
const CompressionPlugin = require("compression-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
    },
  },
  plugins: [
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      pngquant: {
        // lossy png compressor, remove for default lossless
        quality: "75",
      },
      plugins: [
        imageminMozjpeg({
          // lossy jpg compressor, remove for default lossless
          quality: "75",
        }),
      ],
    }),
    new CompressionPlugin({
      test: /\.(html|css|js)(\?.*)?$/i, // only compressed html/css/js, skips compressing sourcemaps etc
    }),
    new CleanWebpackPlugin({
      verbose: true,
      cleanStaleWebpackAssets: true,
    }),
  ],
});
