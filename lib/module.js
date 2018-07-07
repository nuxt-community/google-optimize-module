const { resolve } = require('path')

module.exports = async function module (moduleOptions) {
  const options = Object.assign(
    {
      experimentsDir: '~/experiments',
      maxAge: 60 * 60 * 24 * 7 // 1 Week
    },
    this.options.googleOptimize,
    moduleOptions
  )

  const pluginOpts = {
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'google-optimize.js',
    options
  }

  this.addPlugin(pluginOpts)
  // const { dst } = this.addTemplate(pluginOpts)
  // this.options.plugins.push(resolve(this.options.buildDir, dst))
}
