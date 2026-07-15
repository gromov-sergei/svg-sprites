import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { AngularWebpackPlugin } from '@ngtools/webpack'
import linkerPlugin from '@angular/compiler-cli/linker/babel'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default {
  entry: path.join(rootDir, 'src/main.ts'),
  output: {
    path: path.join(rootDir, 'dist'),
    filename: 'app.[contenthash].js',
    clean: true,
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
  },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [
      { test: /\.ts$/, loader: '@ngtools/webpack' },
      {
        test: /\.[cm]?js$/,
        exclude: /@babel(?:\/|\\)runtime/,
        use: {
          loader: 'babel-loader',
          options: {
            compact: false,
            plugins: [linkerPlugin],
          },
        },
      },
      { test: /\.css$/, use: 'raw-loader' },
      { test: /\.svg$/, type: 'asset/resource' },
    ],
  },
  plugins: [
    new AngularWebpackPlugin({ tsconfig: path.join(rootDir, 'tsconfig.json') }),
    new HtmlWebpackPlugin({ template: path.join(rootDir, 'src/index.html') }),
  ],
  devServer: { host: '127.0.0.1', static: path.join(rootDir, 'dist') },
}
