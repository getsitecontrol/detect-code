import * as puppeteer from 'puppeteer'
import { Browser } from 'puppeteer'

const TIMEOUT = parseInt(process.env.TIMEOUT || '20000')
const executablePath = process.env['CHROME_PATH']
export interface IWidgetResult {
  detected: boolean
  multipleDetected: boolean
  siteId: number[]
  activeWidgets?: number
  runtimeSettings?: object
  error?: Error
}

export async function startBrowser() {
  console.log('starting ', executablePath)
  return await puppeteer.launch({
    executablePath,
    ignoreHTTPSErrors: true,
    dumpio: false,
    headless: true,
    timeout: TIMEOUT,
    userDataDir: '/tmp/user-data',
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
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

export async function detectCodeEval(
  url: string,
  browser: Browser
): Promise<IWidgetResult> {
  const widgetResult: IWidgetResult = {
    detected: false,
    multipleDetected: false,
    siteId: [],
  }
  const page = await browser.newPage()
  try {
    const hookName = `hookWidgets${Date.now()}`
    await page.exposeFunction(hookName, runtimeSettings => {
      widgetResult.multipleDetected = widgetResult.detected
      widgetResult.detected = true
      widgetResult.activeWidgets = runtimeSettings.widgets.reduce(
        (res, w) => (w.disabled ? 0 : 1) + res,
        0
      )
      widgetResult.runtimeSettings = runtimeSettings.settings
      if (runtimeSettings.settings.SITE_ID) {
        widgetResult.siteId = [
          ...widgetResult.siteId,
          runtimeSettings.settings.SITE_ID,
        ]
      }
    })
    await page.evaluateOnNewDocument(hookName => {
      window['_gscq'] = window['_gscq'] || []
      window['_gscq'].loaded = 1
      window['gscwidgets'] = {
        start: options => {
          window[hookName](options)
          window[`${hookName}Done`] = true
        },
        runtime: {
          destroy: function() {},
        },
      }
    }, hookName)
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT,
    })
    await page.waitForFunction(`window.${hookName}Done === true`, {
      polling: 100,
      timeout: TIMEOUT,
    })
  } catch (err) {
    if (!widgetResult.detected) {
      widgetResult.error = err.toString()
    }
  } finally {
    await page.close()
  }
  return widgetResult
}

export async function detectCode(
  url: string,
  browser: Browser
): Promise<IWidgetResult> {
  let widgetResult: IWidgetResult = {
    detected: false,
    multipleDetected: false,
    siteId: [],
  }

  const page = await browser.newPage()
  await page.setRequestInterception(true)

  page.on('request', async request => {
    const type = request.resourceType()
    const url = request.url()
    if (type === 'document' || type === 'xhr') {
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
    await page.goto(url, {
      waitUntil: ['load', 'networkidle0'],
      timeout: TIMEOUT,
    })
  } catch (err) {
    if (!widgetResult.detected) {
      widgetResult.error = err.toString()
    }
  } finally {
    await page.close()
  }
  return widgetResult
}
