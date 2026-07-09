import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import fs from 'node:fs'
import path from 'node:path'
import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack'

const DEFAULT_API_BASE_URL = 'https://www.xssy365.com/'

function parseEnvValue(value: string) {
  const trimmedValue = value.trim()

  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1)
  }

  return trimmedValue
}

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/)

  lines.forEach((line) => {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex <= 0) {
      return
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const value = parseEnvValue(trimmedLine.slice(separatorIndex + 1))

    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

function loadLocalEnv() {
  const rootDir = path.resolve(__dirname, '..')
  loadEnvFile(path.join(rootDir, '.env'))
  loadEnvFile(path.join(rootDir, '.env.local'))
}

loadLocalEnv()

export default defineConfig<'webpack5'>(async () => {
  const apiBaseUrl = process.env.TARO_APP_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL

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
    defineConstants: {
      __API_BASE_URL__: JSON.stringify(apiBaseUrl)
    },
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false
      }
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
