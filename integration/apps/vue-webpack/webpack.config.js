import path from 'node:path'
import { fileURLToPath } from 'node:url'

import HtmlWebpackPlugin from 'html-webpack-plugin'
import webpack from 'webpack'
import { VueLoaderPlugin } from 'vue-loader'

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
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            isCustomElement: (tag) => tag === 'gromlab-sprite-viewer',
          },
        },
      },
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { modules: { namedExport: false } },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    }),
    new HtmlWebpackPlugin({
      templateContent: '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vue Webpack sprite fixture</title></head><body><div id="app"></div></body></html>',
    }),
  ],
}
