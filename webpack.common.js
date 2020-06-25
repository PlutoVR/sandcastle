const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");

const APP_DIR = path.resolve(__dirname, "src/");
const BUILD_DIR = path.resolve(__dirname, "dist/");

module.exports = {
  entry: APP_DIR + "/index.js",
  output: {
    path: BUILD_DIR,
    filename: "./bundle.js",
  },
  module: {
    rules: [
      // {
      //     test: /\.worker\.js$/,
      //     use: { loader: 'worker-loader' }
      // },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif|bmp|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
              name: "[name].[ext]",
              outputPath: "assets/images/",
              publicPath: "assets/images/",
            },
          },
        ],
      },
      {
        test: /\.(gltf)$/,
        use: [
          {
            loader: "gltf-webpack-loader",
          },
        ],
      },
      {
        test: /\.(glb|obj|mtl|fbx|dae|bin)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
              name: "[name].[ext]",
              outputPath: "assets/models/",
              publicPath: "assets/models/",
            },
          },
        ],
      },
      {
        test: /\.(ogg|mp3|wav|mpe?g)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              esModule: false,
              name: "[name].[ext]",
              outputPath: "assets/audio/",
              publicPath: "assets/audio/",
            },
          },
        ],
      },
      {
        test: /\.(glsl|vs|fs)$/,
        loader: "shader-loader",
      },
    ],
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: "defer",
    }),
  ],
  resolve: {
    extensions: [".js", ".es6"],
  },
};
