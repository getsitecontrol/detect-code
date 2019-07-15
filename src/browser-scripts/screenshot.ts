import { Browser } from 'puppeteer'
import { TIMEOUT } from '../options'
const { config } = require('../../package.json')

export async function makeScreenshot(
  url: string,
  width: number,
  height: number,
  browser: Browser
): Promise<Buffer> {
  const page = await browser.newPage()
  await page.evaluateOnNewDocument((prefix:string) => {
    //Disable runtime by emulating already loaded
    const jsonpFunction = `__${prefix}__l`
    window[jsonpFunction] = function() {}
    window[prefix] = window[prefix] || []
    window[prefix] = {
      start: () => null,
      runtime: {
        destroy: function() {}
      }
    }
  }, config.prefix)
  await page.goto(url, {
    waitUntil: ['load', 'networkidle0'],
    timeout: TIMEOUT
  })
  await page.setViewport({ width, height })
  const buffer = await page.screenshot({
    type: 'png',
    fullPage: false
  })
  await page.close()
  return buffer
}
