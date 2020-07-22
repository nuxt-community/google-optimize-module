const { setup, loadConfig, url } = require('@nuxtjs/module-test-utils')
const puppeteer = require('puppeteer')

describe('defaults', () => {
  let nuxt, page, browser

  beforeAll(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage();

    ({ nuxt } = await setup(loadConfig(__dirname)))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
    await browser.close()
  })

  test('variant-0', async () => {
    await page.goto(url('/'))
    const $exp = await page.evaluate(() => window.$exp)

    expect($exp.$experimentIndex).toBe(0)
    expect($exp.$variantIndexes).toEqual([0])
    expect($exp.$activeVariants).toEqual([{ weight: 100 }])
    expect($exp.$classes).toEqual(['exp-test1-0'])
    expect($exp.name).toBe('test1')
    expect($exp.experimentID).toBe('id1')
    expect($exp.variants).toEqual([{ weight: 100 }, { weight: 0 }])
    expect($exp.maxAge).toBe(120)
  })

  test('client = server', async () => {
    const response = await page.goto(url('/'))
    const clientExp = await page.evaluate(() => window.$exp)
    const html = await response.text()
    const result = html.match(/<code>([\s\S]+)<\/code>/im)
    const serverExp = JSON.parse(result[1])
    const props = [
      '$experimentIndex',
      '$variantIndexes',
      '$activeVariants',
      '$classes',
      'name',
      'experimentID',
      'variants'
    ]

    props.forEach(prop => {
      expect(serverExp[prop]).toEqual(clientExp[prop])
    })
  })

  const blockedUserAgents = [
    'AdsBot-Google (+http://www.google.com/adsbot.html)',
    'Baiduspider-image',
    'ia_archiver (+http://www.alexa.com/site/help/webmasters; crawler@alexa.com)'
  ]

  for (const agent of blockedUserAgents) {
    test(`agent: ${agent}`, async () => {
      await page.setUserAgent(agent)
      await page.goto(url('/'))

      const $exp = await page.evaluate(() => window.$exp)
      expect($exp.name).toEqual(undefined)
    })
  }

  const unBlockedUserAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    ''
  ]

  for (const agent of unBlockedUserAgents) {
    test(`agent: ${agent}`, async () => {
      await page.setUserAgent(agent)
      await page.goto(url('/'))

      const $exp = await page.evaluate(() => window.$exp)
      expect($exp.name).toBe('test1')
    })
  }

  test('ga called', async () => {
    await page.goto(url('/'))

    const gaCalled = await page.evaluate(() => window.gaCalled)
    expect(gaCalled).toBe(true)
  })
})
