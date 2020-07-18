const { setup, loadConfig, url } = require('@nuxtjs/module-test-utils')
const puppeteer = require('puppeteer')

describe('basic', () => {
  let nuxt, page, browser

  beforeAll(async () => {
    browser = await puppeteer.launch()
    page = await browser.newPage();

    ({ nuxt } = await setup(loadConfig(__dirname, 'bot-default')))
  }, 60000)

  afterAll(async () => {
    await nuxt.close()
    await browser.close()
  })

  test('bot bot', async () => {
    await page.setUserAgent('AdsBot-Google (+http://www.google.com/adsbot.html)')
    await page.goto(url('/'))

    const $exp = await page.evaluate(() => window.$exp)
    expect($exp.name).toBe('test1')
  })

  test('bot spider', async () => {
    await page.setUserAgent('Baiduspider-image')
    await page.goto(url('/'))

    const $exp = await page.evaluate(() => window.$exp)
    expect($exp.name).toBe('test1')
  })

  test('bot crawler', async () => {
    await page.setUserAgent('ia_archiver (+http://www.alexa.com/site/help/webmasters; crawler@alexa.com)')
    await page.goto(url('/'))

    const $exp = await page.evaluate(() => window.$exp)
    expect($exp.name).toBe('test1')
  })

  test('chrome', async () => {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
    await page.goto(url('/'))

    const $exp = await page.evaluate(() => window.$exp)
    expect($exp.name).toBe('test1')
  })

  test('empty user agent', async () => {
    await page.setUserAgent('')
    await page.goto(url('/'))

    const $exp = await page.evaluate(() => window.$exp)
    expect($exp.name).toBe('test1')
  })
})
