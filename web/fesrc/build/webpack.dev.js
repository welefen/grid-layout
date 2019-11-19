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
        '*': 'http://localhost:8360'
      },
      port: '8361',
      publicPath: '/static/',
      contentBase: '../../www/static/',
      // run dev 打开浏览器
      // open: true,
      // 关闭无用log，只有在报错和warning时报错
      // noInfo: true,
    },
  }
);
