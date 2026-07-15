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
  module: {
    rules: [
      {
        test: /\.css$/,
        resourceQuery: /inline/,
        type: 'asset/source',
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './index.html' })],
}
