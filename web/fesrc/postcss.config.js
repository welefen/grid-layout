
const { resolve, join } = require('path')
const glob = require('glob')
module.exports = {
  plugins: {
    'postcss-import': {
      path: [resolve('../fesrc')],
      resolve(id, basedir) {
        const cwd = process.cwd()
        // 将 theme.css 指向你的项目中的 CSS 变量配置文件
        if (id === './theme.css') return resolve(cwd, './css/abstract/variable.css')
        if (/^clair/.test(id)) return glob.sync(join(cwd, 'node_modules', id))
        return id
      }
    },
    'postcss-for': {},
    'postcss-each': {},
    'postcss-mixins': {},
    'postcss-cssnext': {},
    'postcss-nested': {},
    'postcss-url': {},
  },
}
