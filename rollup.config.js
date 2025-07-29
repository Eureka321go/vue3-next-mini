import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default [
    {
     input: 'packages/vue/src/index.ts',
     output: [
      {
        sourcemap: true,
        format: 'iife',
        file: './packages/vue/dist/vue.esm.js',
        name: 'Vue'
      }
     ],
     // 插件
     plugins: [
        // ts
        typescript({
            sourceMap: true,
        }),
        // 模块导入的路径补全
        resolve(),
        // commonjs 转 esm
        commonjs()
     ]
    }
]