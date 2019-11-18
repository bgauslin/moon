const common = require('./webpack.common.js');
const merge = require('webpack-merge');

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
  },
});
