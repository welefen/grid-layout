const path = require('path')
const webpack = require('webpack')
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
// const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
    new UglifyJSPlugin()
    // new CleanWebpackPlugin(['server/www/static/*', 'server/view/*'], {
    //   // 项目根目录
    //   root: path.resolve(__dirname, './../..'),
    // }),
  ],
})
