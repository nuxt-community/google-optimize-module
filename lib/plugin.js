import weightedRandom from 'weighted-random'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'

import experiments from '<%= options.experimentsDir %>'

export default function (ctx, inject) {
  // Assign experiment and variant to user
  assignExperiment(ctx)

  // Google optimize integration
  googleOptimize(ctx)

  // Inject $experiment
  inject('experiment', ctx.experiment)
}

function assignExperiment (ctx) {
  // Choose experiment and variant
  let experimentIndex = -1
  let variantIndexes = []

  // Try to restore from cookie
  const cookie = getCookie(ctx, 'exp') || '' // experimentID.var1-var2
  const [cookieExp, cookieVars] = cookie.split('.')
  if (cookieExp.length) {
    // Try to find experiment with that id
    experimentIndex = experiments.findIndex(
      exp => exp.experimentID === cookie[0]
    )

    // Varaint indexes
    variantIndexes = cookieVars.split('-').map(v => parseInt(v))
  }

  // Choose one experiment
  if (experimentIndex === -1) {
    experimentIndex = weightedRandom(experiments.map(exp => exp.weight === undefined ? 1 : exp.weight))
  }
  const experiment = experiments[experimentIndex]

  // Validate variantIndexes against experiment (comming from cookie)
  variantIndexes = variantIndexes.filter(index => experiment.variants[index])

  // Choose enough variants
  const varaintWeights = experiment.variants.map(variant => variant.weight === undefined ? 1 : variant.weight)
  while (variantIndexes.length < (experiment.sections || 1)) {
    const index = weightedRandom(varaintWeights)
    varaintWeights[index] = 0
    variantIndexes.push(index)
  }

  // Write exp cookie if changed
  const expCookie = experiment.experimentID + '.' + variantIndexes.join('-')
  if (cookie !== expCookie) {
    setCookie(ctx, 'exp', expCookie, experiment.magAge)
  }

  // Compute global classes to be injected
  const classes = variantIndexes.map(index => 'exp-' + experiment.name + '-' + index)

  ctx.experiment = {
    $experimentIndex: experimentIndex,
    $variantIndexes: variantIndexes,
    $activeVariants: variantIndexes.map(index => experiment.variants[index]),
    $classes: classes,
    ...experiment
  }
}

function getCookie (ctx, name) {
  if (process.server && !ctx.req) {
    return
  }

  // Get and parse cookies
  const cookieStr = process.browser ? document.cookie : ctx.req.headers.cookie
  const cookies = parseCookie(cookieStr || '') || {}

  return cookies[name]
}

function setCookie (ctx, name, value, maxAge = 60 * 60 * 24 * 7 /* 1 week */) {
  const serializedCookie = serializeCookie(name, value, {
    path: '/',
    maxAge
  })

  if (process.client) {
    // Set in browser
    document.cookie = serializedCookie
  } else if (process.server && ctx.res) {
    // Send Set-Cookie header from server side
    ctx.res.setHeader('Set-Cookie', serializedCookie)
  }
}

// https://developers.google.com/optimize/devguides/experiments
function googleOptimize ({ experiment }) {
  if (process.server || !window.ga) {
    return
  }

  const exp = experiment.experimentID + '.' + experiment.$variantIndexes.join('-')

  window.ga('set', 'exp', exp)
}
