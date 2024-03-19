const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    moon: './src/js/moon.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      { from: 'src/img', to: 'img' },
      { from: 'src/pwa', to: 'pwa' },
      { from: 'src/root' },
    ]),
    new Dotenv(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/html/index.html',
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: 'src/js/sw.js',
      swDest: 'sw.js',
      exclude: [/\.htaccess$/, /robots\.txt$/, /\.DS_Store$/],
    }),
  ],
  node: {
    fs: 'empty',
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/typescript',
            ],
            plugins: [
              'babel-plugin-transform-es2015-modules-commonjs',
            ],
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ]
  }
}