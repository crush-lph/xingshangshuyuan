import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import path from 'node:path'
import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack'

export default defineConfig<'webpack5'>(async () => {
  const config: UserConfigExport<'webpack5'> = {
    projectName: 'xingshangshuyuan',
    date: '2026-06-19',
    designWidth(input) {
      const file = typeof input === 'object' && input !== null && 'file' in input ? input.file : undefined
      if (typeof file === 'string' && file.replace(/\\/g, '/').includes('@nutui')) {
        return 375
      }
      return 750
    },
    deviceRatio: {
      375: 2,
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    },
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: 'webpack5',
    sass: {
      data: '@import "@nutui/nutui-react-taro/dist/styles/variables.scss";'
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false
        }
      },
      webpackChain(chain) {
        chain.plugin('weapp-tailwindcss').use(UnifiedWebpackPluginV5, [
          {
            appType: 'taro',
            rem2rpx: true
          }
        ])
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: {
          enable: true
        },
        cssModules: {
          enable: false
        }
      }
    }
  }

  return config
})
