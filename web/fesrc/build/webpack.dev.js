const path = require('path')
const common = require('./webpack.common.js');
const merge = require('webpack-merge');
// const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(common,
  {
    module: {
      rules: [
        {
          test: /\.js$/,
          // exclude: [path.resolve(__dirname, "./../node_modules/")],
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: [['env', {modules: false}]],
            plugins: [
              [
                'component',
                {
                  libraryName: 'element-ui',
                  styleLibraryName: 'theme-chalk',
                },
              ],
            ],
          },
        },
      ]
    },
    plugins: [

    ],
    // 开启source-map
    devtool: 'source-map',
    devServer: {
      proxy: {
        '*': 'http://localhost:8080'
      },
      port: '8361',
      publicPath: '/static/',
      contentBase: '../../www/static/'
    },
  }
);
