const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    app: './src/js/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/img', to: 'img' },
        { from: 'src/pwa', to: 'pwa' },
        { from: 'src/root' },
      ],
    }),
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
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        // App shell styles and custom properties.
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, 'src/styles')
        ],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss'],
  },
}