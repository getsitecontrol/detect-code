import * as puppeteer from 'puppeteer'
import { Browser } from 'puppeteer'

const TIMEOUT = parseInt(process.env.TIMEOUT || '20000')

export interface IWidgetResult {
  detected: boolean
  multipleDetected: boolean
  siteId: number[]
  error?: Error
}

export async function startBrowser() {
  return await puppeteer.launch({
    ignoreHTTPSErrors: true,
    dumpio: false,
    headless: true,
    timeout: TIMEOUT,
    userDataDir: '/tmp/user-data',
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1280x1696', // Letter size
      '--hide-scrollbars',
      '--v=99',
      '--single-process',
      '--data-path=/tmp/data-path',
      '--ignore-certificate-errors', // Dangerous?
      '--homedir=/tmp',
      '--disk-cache-dir=/tmp/cache-dir',
    ],
  })
}

export async function detectCode(
  url: string,
  browser: Browser
): Promise<IWidgetResult> {
  const widgetResult: IWidgetResult = {
    detected: false,
    multipleDetected: false,
    siteId: [],
  }

  const page = await browser.newPage()
  await page.setRequestInterception(true)

  page.on('request', async request => {
    const type = request.resourceType()
    const url = request.url()
    if (type === 'document') {
      request.continue()
      return //Don't touch docuemnts
    }
    if (type === 'script') {
      let match
      if (
        type === 'script' &&
        (match = /widgets\.getsitecontrol\.com\/(\d+?)\/script\.js/.exec(url))
      ) {
        widgetResult.multipleDetected = widgetResult.detected
        widgetResult.detected = true
        widgetResult.siteId.push(parseInt(match[1]))
      }
      if (!widgetResult.detected) {
        request.continue()
        return
      }
    }
    //Abort all other
    request.abort()
  })

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT })
  } catch (err) {
    if (!widgetResult.detected) {
      widgetResult.error = err
    }
  } finally {
    await page.close()
  }
  return widgetResult
}
