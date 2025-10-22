const common = require('./webpack.common.js');
const {merge} = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name].js',
  },
  devServer: {
    historyApiFallback: {
      index: '/index.html',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      base: '/',
      filename: 'index.html',
      template: 'src/html/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
});