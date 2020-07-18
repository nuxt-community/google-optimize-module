const { setup, loadConfig, url } = require('@nuxtjs/module-test-utils')
const puppeteer = require('puppeteer')

describe('basic', () => {
  let nuxt, page, browser

  beforeAll(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage();

    ({ nuxt } = await setup(loadConfig(__dirname, 'basic')))
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
    // expect($exp.sections).toBe(2)
    expect($exp.maxAge).toBe(120)
  })

  // making sure server stuff = client
  test('client = server', async () => {
    // await page.setUserAgent('AdsBot-Google (+http://www.google.com/adsbot.html)')

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
})
