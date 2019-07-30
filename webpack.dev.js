const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: 'moon.js',
  },
  devServer: {
    contentBase: './dist',
    historyApiFallback: {
      index: '/index.html',
    },
    port: 3000,
  },
});
