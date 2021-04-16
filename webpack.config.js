const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack');

module.exports = {
  entry: {
    CourseBrowser: './CourseBrowser/src/index.js',
  },
  output: {
    path: path.resolve('./CourseBrowser/static/CourseBrowser/'),
    filename: '[name]-[hash].js',
    publicPath: 'static/CourseBrowser/',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BundleTracker({
      path: __dirname,
      filename: './webpack-stats.json',
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}