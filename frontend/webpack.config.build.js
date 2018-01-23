const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpackConfig = require('./webpack.config')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const StyleExtHtmlWebpackPlugin = require('style-ext-html-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const appHtmlTitle = 'Tayyibun'

module.exports = Object.assign(webpackConfig, {
  entry: Object.assign({}, webpackConfig.entry, {
      vendor: ['lodash', 'moment', 'underscore', 'react-bootstrap', 'jquery']
    }),
  devtool: '',
  output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].[chunkhash].js'
  },
  plugins: webpackConfig.plugins.concat([
      new UglifyJSPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.MinChunkSizePlugin({minChunkSize: 10000}),
      new webpack.optimize.CommonsChunkPlugin({
          names: ['vendor', 'manifest']
      }),
      new CleanWebpackPlugin(['dist']),
      new ExtractTextPlugin('[name].[contenthash].css', { allChunks: true }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '/src/index.ejs'),
        title: appHtmlTitle
      })
  ])
})
