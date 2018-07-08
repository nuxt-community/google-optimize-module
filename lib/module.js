const { resolve } = require('path')

module.exports = async function module (moduleOptions) {
  const options = Object.assign(
    {
      pushPlugin: true,
      experimentsDir: '~/experiments',
      maxAge: 60 * 60 * 24 * 7, // 1 Week
      plugins: []
    },
    this.options.googleOptimize,
    moduleOptions
  )

  const pluginOpts = {
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'google-optimize.js',
    options
  }

  if (options.pushPlugin) {
    const { dst } = this.addTemplate(pluginOpts)
    this.options.plugins.push(resolve(this.options.buildDir, dst))
  } else {
    this.addPlugin(pluginOpts)
  }

  // Extend with plugins
  if (options.plugins) {
    options.plugins.forEach(p => this.options.plugins.push(p))
  }
}
