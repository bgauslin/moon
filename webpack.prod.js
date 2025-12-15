const common = require('./webpack.common.js');
const {merge} = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[contenthash].js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      base: '/luna/',
      filename: 'index.html',
      template: 'src/html/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
    }),
  ]
});