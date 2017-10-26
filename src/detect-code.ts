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

  console.log('launching', options)
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    dumpio: true,
    args: [
      '--headless', // Redundant?
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1280x1696', // Letter size
      '--no-sandbox',
      '--user-data-dir=/tmp/user-data',
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

  console.log('opening new page')
  const page = await browser.newPage()

  console.log('opened new page')
  await page.setRequestInterceptionEnabled(true)

  page.on('request', async request => {
    console.log('request', request.resourceType, request.url)
    const type = request.resourceType as string
    if (type === 'document' || type === 'script') {
      let match
      if (type === 'script' && (match = /widgets\.getsitecontrol\.com\/(\d+?)\/script\.js/.exec(request.url))) {
        widgetResult.multipleDetected = widgetResult.detected
        widgetResult.detected = true
        widgetResult.siteId.push(parseInt(match[1]))
      }
      request.continue()
    }
    else {
      request.abort();
    }
  })

  console.log('opening page', url)
  await page.goto(url, {waitUntil: 'networkidle'})

  console.log('closing')
  await browser.close()
  return widgetResult
}