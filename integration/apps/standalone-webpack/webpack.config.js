import path from 'node:path'
import { fileURLToPath } from 'node:url'

import HtmlWebpackPlugin from 'html-webpack-plugin'

const root = path.dirname(fileURLToPath(import.meta.url))

export default {
  entry: './src/main.ts',
  output: {
    path: path.join(root, 'dist'),
    filename: 'assets/app.[contenthash].js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
  ],
}
