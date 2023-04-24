import weightedRandom from 'weighted-random'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'
import experiments from '<%= options.experimentsDir %>'

export default function (ctx, inject) {
  // Assign experiment and variant to user
  assignExperiment(ctx)

  if (<%= options.emitOnLoad %>) {
    googleOptimize(ctx)
  }
  
  // Inject $exp
  inject('exp', ctx.experiment)
}

// Choose experiment and variant
function assignExperiment(ctx) {
  let experimentIndex = -1
  let experiment = {}
  let variantIndexes = []
  let classes = []

  // Try to restore from cookie
  const cookie = getCookie(ctx, 'exp') || '' // experimentID.var1-var2
  const [cookieExp, cookieVars] = cookie.split('.')

  if (cookieExp && cookieVars) {
    // Try to find experiment with that id
    experimentIndex = experiments.findIndex(exp => exp.experimentID === cookieExp)
    experiment = experiments[experimentIndex]

    // Variant indexes
    variantIndexes = cookieVars.split('-').map(v => parseInt(v))
  }

  // Choose one experiment
  const experimentWeights = experiments.map(exp => exp.weight === undefined ? 1 : exp.weight)
  let retries = experiments.length
  while (experimentIndex === -1 && retries-- > 0) {
    experimentIndex = weightedRandom(experimentWeights)
    experiment = experiments[experimentIndex]

    // Check if current user is eligible for experiment
    if (typeof experiment.isEligible === 'function') {
      if (!experiment.isEligible(ctx)) {
        // Try another one
        experimentWeights[experimentIndex] = 0
        experimentIndex = -1
      }
    }
  }

  if (experimentIndex !== -1 && !skipAssignment(ctx)) {
    // Validate variantIndexes against experiment (coming from cookie)
    variantIndexes = variantIndexes.filter(index => experiment.variants[index])

    // Choose enough variants
    const variantWeights = experiment.variants.map(variant => variant.weight === undefined ? 1 : variant.weight)
    while (variantIndexes.length < (experiment.sections || 1)) {
      const index = weightedRandom(variantWeights)
      variantWeights[index] = 0
      variantIndexes.push(index)
    }

    const expCookie = experiment.experimentID + '.' + variantIndexes.join('-')

    // expose raw optimize token directly
    experiment.token = expCookie

    // Write exp cookie if changed
    if (cookie !== expCookie) {
      setCookie(ctx, 'exp', expCookie, experiment.maxAge)
    }

    // Compute global classes to be injected
    classes = variantIndexes.map(index => 'exp-' + experiment.name + '-' + index)
  } else {
    // No active experiment
    experiment = {}
    variantIndexes = []
    classes = []
  }

  ctx.experiment = {
    $experimentIndex: experimentIndex,
    $variantIndexes: variantIndexes,
    $activeVariants: variantIndexes.map(index => experiment.variants[index]),
    $classes: classes,
    ...experiment
  }
}

function getCookie(ctx, name) {
  if (process.server && !ctx.req) {
    return
  }

  // Get and parse cookies
  const cookieStr = process.client ? document.cookie : ctx.req.headers.cookie
  const cookies = parseCookie(cookieStr || '') || {}

  return cookies[name]
}

function setCookie(ctx, name, value, maxAge = <%= options.maxAge %>) {
  const serializedCookie = serializeCookie(name, value, {
    path: '/',
    maxAge
  })

  if (process.client) {
    // Set in browser
    document.cookie = serializedCookie
  } else if (process.server && ctx.res) {
    // Send Set-Cookie header from server side
    const prev = ctx.res.getHeader('Set-Cookie')
    let value = serializedCookie
    if (prev) {
      value = Array.isArray(prev) ? prev.concat(serializedCookie)
        : [prev, serializedCookie]
    }
    ctx.res.setHeader('Set-Cookie', value)
  }
}

// https://developers.google.com/optimize/devguides/experiments
function googleOptimize({ experiment }) {
  if (process.server || !window.ga || !experiment || !experiment.token) {
    return
  }

  window.ga('set', 'exp', experiment.token)
}

// should we skip bots?
function skipAssignment(ctx) {
  if (!<%= options.excludeBots %>) { 
    return 
  }

  if (process.server) {
    return ctx.req &&
      ctx.req.headers &&
      ctx.req.headers['user-agent'] &&
      ctx.req.headers['user-agent'].match(<%= options.botExpression %>)
  }

  return navigator.userAgent.match(<%= options.botExpression %>)
}