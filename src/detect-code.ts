import * as puppeteer from 'puppeteer'
import {LaunchOptions} from 'puppeteer'

export interface IWidgetResult {
  detected: boolean
  multipleDetected: boolean
  siteId: number[]
}

export async function detectCode (url: string, options?: LaunchOptions): Promise<IWidgetResult> {
  const widgetResult: IWidgetResult = {
    detected: false,
    multipleDetected: false,
    siteId: []
  }

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    dumpio: false,
    headless: true,
    timeout: 10000,
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
    ...options
  })

  const page = await browser.newPage()

  await page.setRequestInterceptionEnabled(true)

  page.on('request', async request => {
    const type = request.resourceType as string
    if (type === 'document' || type === 'script') {
      let match
      if (type === 'script' && (match = /widgets\.getsitecontrol\.com\/(\d+?)\/script\.js/.exec(request.url))) {
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

  await page.goto(url, {waitUntil: 'networkidle'})

  await browser.close()
  return widgetResult
}