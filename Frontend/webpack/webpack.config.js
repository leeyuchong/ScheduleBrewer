const path = require("path");
const BundleTracker = require("webpack-bundle-tracker");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpack = require("webpack");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: {
    CourseBrowser: "./src/index.js",
  },
  output: {
    path: path.resolve("./static/course_browser_js/"),
    filename: "[name]-[hash].js",
    publicPath: "./static/course_browser_js/",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BundleTracker({
      path: __dirname,
      filename: "./webpack/webpack-stats.json",
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new Dotenv({
      path: "../.env",
    }),
    // new webpack.DefinePlugin({
    //   "process.env": {
    //     HOSTNAME: JSON.stringify(process.env.HOSTNAME),
    //   },
    // }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
