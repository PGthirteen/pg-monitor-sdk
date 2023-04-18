const path = require('path')
const ts = require('rollup-plugin-typescript2')
const dts = require('rollup-plugin-dts').default

// 为什么使用rollup作为项目构建工具？ 库 小、少、简洁
// web网站  ->  功能多、代码多、业务复杂  -> webpack, vite

// rollup怎么运行打包 ?  npx rollup -c
// tsconfig.json ->  配置 module: ESNext
// webpack怎么运行打包 ? npx webpack
const resolve = url => path.resolve(__dirname, url)

module.exports = [
  // TS
  {
    // 打包入口
    input: './src/core/index.ts',
    // vue react script
    // 输出目录
    output: [
      // Browser
      {file: resolve('lib/index.js'), format: 'umd', name: 'ys'},
      // ESM  import/export
      {file: resolve('lib/index.esm.js'), format: 'esm'},
      // cjs  require / export
      {file: resolve('lib/index.cjs.js'), format: 'cjs'}
    ],
    // 插件
    plugins: [ts()],
    // 监听器【监听文件改变 ->  打包】
    watch: {exclude: 'node_modules/**'}
  },
  // D.TS
  {
    input: './src/core/index.ts',
    output: {file: resolve('lib/index.d.ts')},
    plugins: [dts()]
  }
]