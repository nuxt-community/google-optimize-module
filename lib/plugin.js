import weightedRandom from 'weighted-random'
import { parse as parseCookie, serialize as serializeCookie } from 'cookie'
import experiments from '<%= options.experimentsDir %>'

export default function (ctx, inject) {
  // Assign experiment and variant to user
  assignExperiment(ctx)

  // Google optimize integration
  // We dont need this, we use gtm-optimize plugin in the app
  // googleOptimize(ctx)

  // Inject $exp
  inject('exp', ctx.experiment)
}

// Choose experiment and variant
function assignExperiment(ctx) {
  let experiment = {}
  let variantIndexes = []
  let classes = []

  // Try to restore from cookie
  const cookie = getCookie(ctx, 'exp') || '' // experimentID.var1-var2!experimentID1.var1-var2!experimentIDN.var1-var2
  const cookieExperiments = cookie.split('!')

  const allExperiments = {}
  const cookiesToSet = []

  experiments.forEach((experiment, experimentIndex) => {

    const cookieValues = cookieExperiments.filter(ce => ce.split('.')[0] === experiment.experimentID)

    if (cookieValues.length > 0) {

      const [cookieExp, cookieVars] = cookieValues[0].split('.')

      if (cookieExp && cookieVars) {
        // Variant indexes
        variantIndexes = cookieVars.split('-').map(v => parseInt(v))
      }
    }

    if (!skipAssignment(ctx)) {
      // Validate variantIndexes against experiment (coming from cookie)
      variantIndexes = variantIndexes.filter(index => experiment.variants[index])

      // Choose enough variants
      const variantWeights = experiment.variants.map(variant => variant.weight === undefined ? 1 : variant.weight)
      while (variantIndexes.length < (experiment.sections || 1)) {
        const index = weightedRandom(variantWeights)
        variantWeights[index] = 0
        variantIndexes.push(index)
      }

      // Write exp cookie if changed
      const expCookie = experiment.experimentID + '.' + variantIndexes.join('-')
      cookiesToSet.push(expCookie)

      // Compute global classes to be injected
      classes = variantIndexes.map(index => 'exp-' + experiment.name + '-' + index)

      allExperiments[experiment.name] = {
        $experimentIndex: experimentIndex,
        $variantIndexes: variantIndexes,
        $activeVariants: variantIndexes.map(index => experiment.variants[index]),
        $classes: classes,
        ...experiment
      }
    }

  })

  const expsCookie = cookiesToSet.join('!')
  if (cookie !== expsCookie) {
    setCookie(ctx, 'exp', expsCookie)
  }

  ctx.experiment = allExperiments
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
  if (process.server || !experiment || !experiment.experimentID) {
    return
  }

  const exp = experiment.experimentID + '.' + experiment.$variantIndexes.join('-')

  // we don't use analytics.js api
  // window.ga('set', 'exp', exp)
  // instead we use dataLayer for gtm.js api
  if (window.dataLayer) {
    window.dataLayer.push({
      expId: experiment.experimentID,
      expVar: experiment.$variantIndexes.join('-')
    })
  }

}

// should we skip bots?
function skipAssignment(ctx) {
  if (!<%= options.excludeBots %>) { return }

  if (process.server) {
    return ctx.req &&
      ctx.req.headers &&
      ctx.req.headers['user-agent'] &&
      ctx.req.headers['user-agent'].match(<%= options.botExpression %>)
  }

  return navigator.userAgent.match(<%= options.botExpression %>)
}
