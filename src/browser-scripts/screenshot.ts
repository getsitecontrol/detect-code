import { Browser } from 'puppeteer'
import { TIMEOUT } from '../options'

export async function makeScreenshot(
  url: string,
  width: number,
  height: number,
  browser: Browser
): Promise<Buffer> {
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(() => {
    //Disable runtime by emulating already loaded
    window['_gscq'] = window['_gscq'] || []
    window['_gscq'].loaded = 1
    window['gscwidgets'] = {
      start: () => null,
      runtime: {
        destroy: function() {},
      },
    }
  })
  await page.goto(url, {
    waitUntil: ['load', 'networkidle0'],
    timeout: TIMEOUT,
  })
  await page.setViewport({ width, height })
  const buffer = await page.screenshot({
    type: 'png',
    fullPage: false
  })
  await page.close()
  return buffer
}
