const config = {
  projectName: 'kpool-v2',
  date: '2026-07-30',
  designWidth: 375,
  deviceRatio: {
    375: 2,
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: process.env.TARO_ENV === 'h5' ? 'dist-h5' : 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  framework: 'react',
  compiler: 'webpack5',
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      cssModules: { enable: false },
    },
  },
  h5: {
    publicPath: process.env.PUBLIC_PATH || '/',
    staticDirectory: 'static',
  },
}

module.exports = function () {
  return config
}
