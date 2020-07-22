const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '../..'),
  srcDir: __dirname,
  buildDir: resolve(__dirname, '.nuxt'),
  dev: false,
  render: {
    resourceHints: false
  },
  modules: [resolve(__dirname, '../../lib/module')],
  head: {
    script: [{
      hid: 'ga',
      innerHTML: 'window.ga = function(){ window.gaCalled = true }'
    }],
    __dangerouslyDisableSanitizersByTagID: {
      ga: ['innerHTML']
    }
  }
}
