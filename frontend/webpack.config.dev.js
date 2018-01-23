const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpackConfig = require('./webpack.config')
const appHtmlTitle = 'Dev - Tayyibun'

module.exports = Object.assign(webpackConfig, {
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    webpackConfig.entry.bundle
  ],
  devtool: 'cheap-eval-source-map',
  output: {
      pathinfo: true,
      publicPath: '/',
      filename: '[name].js'
  },
  devServer: {
    port: 3000,
    inline: true,    
    hot: true,
    historyApiFallback: {
      rewrites: [
        {
          from: /^(?!.*\/api).*$/,
          to: function () {
            return '/';
          }
        }
      ]
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    proxy: {
      "/api": {
        target: 'http://localhost',
        secure: false,
        changeOrigin: false,
        pathRewrite: { "^/api" : "/backend/public" }
      },
    }
  },
  plugins: webpackConfig.plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, '/src/index.ejs'),
        title: appHtmlTitle
      })
  ])
})
