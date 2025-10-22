const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const FontPreloadPlugin = require('webpack-font-preload-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    app: './src/js/index.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {from: 'src/images', to: 'images'},
        {from: 'src/root'},
      ],
    }),
    new Dotenv(),
    new FontPreloadPlugin({
      index: 'index.html',
      insertBefore: 'link:first-of-type',
      loadType: 'preload',
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
        test: /\.scss$/,
        include: [
          path.resolve(__dirname, 'src/styles')
        ],
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              api: 'modern',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss'],
  },
}