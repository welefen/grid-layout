const path = require('path')
const Logger = require('think-logger3')
const colors = require('colors')
const glob = require('glob')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// const HtmlWebpackPlugin = require('html-webpack-plugin')
// const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
// const webpack = require('webpack')

const entryBase = path.resolve(__dirname, '../view')
// const templateBase = path.resolve(__dirname, '../view')
const staticBase = path.resolve(__dirname, '../../www/static')
// const viewBase = path.resolve(__dirname, '../view')

/* logger */
const logger = new Logger({
  handle: Logger.Console,
  layout: {
    type: 'pattern',
    pattern: `%[[%r]%] ${colors.yellow('webpack')} - %[%m%]`,
  },
})

/* 提取css */
const cssExtract = new ExtractTextPlugin({
  filename: 'css/[name].css',
  ignoreOrder: false,
})
const cssLoaders = cssExtract.extract({
  fallback: 'style-loader',
  use: ['css-loader', 'postcss-loader'],
})

/* 动态生成所有入口 entries */
const fileList = glob.sync(`${entryBase}/*.js`)
const entries = {}
const entriesName = []
// const htmlWebpackPlugins = []
fileList.forEach((filename) => {
  const name = path.relative(entryBase, filename).replace(/\.js$/, '')
  entries[name] = filename
  entriesName.push(name)
  // 自动生成 html 文件
  // htmlWebpackPlugins.push(new HtmlWebpackPlugin({
  //   template: `html-loader!${templateBase}/${name}/main.html`,
  //   filename: `${viewBase}/${name}.html`,
  //   chunks: ['runtime', 'common', 'global', name],
  //   chunksSortMode(a, b) {
  //     const orders = ['runtime', 'common', 'global', name]
  //     return orders.indexOf(a.names[0]) > orders.indexOf(b.names[0]) ? 1 : 0
  //   },
  //   alwaysWriteToDisk: true,
  // }))
})
logger.info(entries)

// /* 动态将fesrc/view下inc中的html内容复制到view中 */
// const incFileList = glob.sync(`${entryBase}/inc/*/*.html`)
// const copyIncHtmlWebpackPlugins = incFileList.map((filename) => {
//   const name = path.relative(entryBase, filename)
//   return new HtmlWebpackPlugin({
//     template: `html-loader!${filename}`,
//     filename: `${viewBase}/${name}`,
//     inject: false,
//     alwaysWriteToDisk: true,
//   })
// })

// function isVendor(module) {
//   return (
//     module.context
//     && module.context.includes('node_modules')
//     && module.resource
//     && /^.*.js$/.test(module.resource)
//   )
// }

module.exports = {
  /* 通过函数返回entries不可行，所以在外部生成entries后传入 */
  entry: entries,
  output: {
    path: staticBase,
    filename: 'js/[name].js',
    publicPath: '/static/',
    hashDigestLength: 16,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          autoprefixer: false,
          html: {
            root: path.resolve(__dirname, '../../fesrc/'),
          },
          loaders: {
            css: cssLoaders,
          },
          cssSourceMap: true,
        },
      },
      // {
      //   test: /\.js$/,
      //   // exclude: [path.resolve(__dirname, "./../node_modules/")],
      //   exclude: /node_modules/,
      //   loader: 'babel-loader',
      //   options: {
      //     presets: [['env', {modules: false}]],
      //     plugins: [
      //       [
      //         'component',
      //         {
      //           libraryName: 'element-ui',
      //           styleLibraryName: 'theme-chalk',
      //         },
      //       ],
      //     ],
      //   },
      // },
      {
        test: /\.css$/,
        use: cssLoaders,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: '10000',
          name: 'img/[name]-[hash].[ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'url-loader',
        options: {
          limit: '10000',
          name: 'font/[name]-[hash].[ext]',
        },
      },
    ],
  },
  plugins: [
    cssExtract,
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: "global",
    //   chunks: entriesName,
    //   filename: "js/[name].js",
    //   minChunks(module, count) {
    //     return count > 1 && !isVendor(module);
    //   }
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: "common",
    //   chunks: entriesName,
    //   filename: "js/[name].js",
    //   minChunks(module, count) {
    //     return count > 1 && isVendor(module);
    //   }
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: "runtime",
    //   chunks: ["global", "common"],
    //   filename: "js/[name].js"
    // }),
    // new HtmlWebpackHarddiskPlugin(),
    // ...htmlWebpackPlugins,
    // ...copyIncHtmlWebpackPlugins,
  ],
  resolve: {
    // 模块别名定义，方便后续直接引用别名，无须多写长长的地址
    // 所有别名定义都以_开头，这样能够很方便地识别是别名路径查找还是默认路径查找
    alias: {
      // // 资源类目录
      // _css: path.resolve(__dirname, '../../fesrc/css'),
      // _img: path.resolve(__dirname, '../../fesrc/img'),
      // _js: path.resolve(__dirname, '../../fesrc/js'),
      // // 常用
      // // _vue: path.resolve(
      // //   __dirname,
      // //   '../../fesrc/node_modules/vue/dist/vue.esm.js'
      // // ),
      // _bus: path.resolve(__dirname, '../js/util/eventBus.js'),
      // _uc_sync: path.resolve(__dirname, '../js/sync/usercenter_sync.js'),
      // _ad_sync: path.resolve(__dirname, '../js/sync/admin_sync.js'),
      // _index_sync: path.resolve(__dirname, '../js/sync/index_sync.js'),
      // _utils: path.resolve(__dirname, '../js/util/util.js'),
      // _configs: path.resolve(__dirname, '../js/util/configs.js'),
    },
    mainFields: ['browser', 'main', 'module'],
    enforceExtension: false,
    modules: [path.resolve(__dirname, '../../fesrc/js'), 'node_modules'],
  },
  externals: {
    jquery: 'jQuery',
    Vue: 'Vue',
    // ElementUI: 'ElementUI',
    // ChimeePlayer: 'ChimeePlayer'
  },
}
