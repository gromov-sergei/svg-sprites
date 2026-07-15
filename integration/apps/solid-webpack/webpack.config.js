import path from 'node:path'
import { fileURLToPath } from 'node:url'

import HtmlWebpackPlugin from 'html-webpack-plugin'

const root = path.dirname(fileURLToPath(import.meta.url))

export default {
  entry: './src/main.jsx',
  output: {
    path: path.join(root, 'dist'),
    filename: 'assets/app.[contenthash].js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
    clean: true,
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    conditionNames: ['browser', 'import', 'require', 'default'],
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['babel-preset-solid'] },
        },
      },
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
      templateContent: '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Solid Webpack sprite fixture</title></head><body><div id="root"></div></body></html>',
    }),
  ],
}
