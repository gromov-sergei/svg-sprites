import path from 'node:path'
import { fileURLToPath } from 'node:url'

import HtmlWebpackPlugin from 'html-webpack-plugin'

const root = path.dirname(fileURLToPath(import.meta.url))

export default {
  entry: './src/main.js',
  output: {
    path: path.join(root, 'dist'),
    filename: 'assets/app.[contenthash].js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
    clean: true,
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      preact: path.resolve(root, '../../node_modules/preact'),
    },
  },
  module: {
    rules: [
      {
        test: /\.module\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { modules: { namedExport: false } } }],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preact Webpack sprite fixture</title></head><body><div id="root"></div></body></html>',
    }),
  ],
}
