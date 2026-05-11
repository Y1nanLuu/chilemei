import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'
import NutUIResolver from '@nutui/auto-import-resolver'
import Components from 'unplugin-vue-components/webpack'
import path from 'path' // 或者 const path = require('path')

// https://taro-docs.jd.com/docs/next/config#defineconfig-helper
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'chilemei',
    date: '2026-3-23',
    designWidth(input) {
      // Use NutUI 375 design width
      if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
        return 375
      }
      // Default to Taro 750 design width
      return 750
    },
    alias: {
    // 这里的 '..' 是因为 config 文件夹通常在根目录下，向上跳一级才能找到 src
    '@': path.resolve(__dirname, '..', 'src'),
    '@/api': path.resolve(__dirname, '..', 'src/api'),
    '@/utils': path.resolve(__dirname, '..', 'src/utils'),
    '@/components': path.resolve(__dirname, '..', 'src/components'),
    },
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {
      'process.env.TARO_APP_CLOUD_ENV': JSON.stringify('chilemei-backend-5fyl0ivfcc9347f'),
      'process.env.TARO_APP_CLOUD_SERVICE': JSON.stringify('chilemei'),
      'process.env.TARO_APP_CLOUD_BUCKET': JSON.stringify('6368-chilemei-backend-5fyl0ivfcc9347f-1328995507'),
      'process.env.TARO_APP_MEDIA_BASE_URL': JSON.stringify('https://6368-chilemei-backend-5fyl0ivfcc9347f-1328995507.tcb.qcloud.la'),
    },
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'vue3',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false,
      },
    },
    cache: {
      enable: false, // Webpack persistent cache (see https://docs.taro.zone/docs/config-detail#cache)
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // Enable if you want CSS Modules
          config: {
            namingPattern: 'module', // global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        chain.plugin('unplugin-vue-components').use(
          Components({
            resolvers: [NutUIResolver({ taro: true })],
          }),
        )
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js',
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // Enable if you want CSS Modules
          config: {
            namingPattern: 'module', // global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        chain.plugin('unplugin-vue-components').use(
          Components({
            resolvers: [NutUIResolver({ taro: true })],
          }),
        )
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // Enable if you want CSS Modules
        },
      },
    },
  }
  if (process.env.NODE_ENV === 'development') {
    // Development build config (no minify)
    return merge({}, baseConfig, devConfig)
  }
  // Production build config (default minify)
  return merge({}, baseConfig, prodConfig)
})

