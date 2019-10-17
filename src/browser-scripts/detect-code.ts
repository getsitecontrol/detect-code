import * as puppeteer from 'puppeteer'
import { Browser } from 'puppeteer'
import { TIMEOUT } from '../options'
const { config } = require('../../package.json')

export interface IWidgetResult {
  detected: boolean
  multipleDetected: boolean
  siteId: string[]
  activeWidgets?: number
  runtimeSettings?: object
  error?: Error
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
    await page.exposeFunction(hookName, (...args: any[]) => {
      const [runtimeSettings, siteId] = args
      widgetResult.siteId = [...widgetResult.siteId, siteId] //args.length
      widgetResult.multipleDetected = widgetResult.detected
      widgetResult.detected = true
      widgetResult.activeWidgets = runtimeSettings.widgets.reduce(
        (res, w) => (w.disabled ? 0 : 1) + res,
        0
      )
    })
    await page.evaluateOnNewDocument(
      (hookName: string, prefix: string) => {
        window[prefix] = {
          start: (...args: any[]) => {
            window[hookName](...args)
            window[`${hookName}Done`] = true
          },
          runtime: {
            destroy: function() {}
          }
        }
      },
      hookName,
      config.prefix
    )
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT
    })
    await page.waitForFunction(`window.${hookName}Done === true`, {
      polling: 100,
      timeout: TIMEOUT
    })
  } catch (err) {
    if (!widgetResult.detected) {
      widgetResult.error = err.toString()
    }
    console.error('error detecting eval', err)
  } finally {
    schedulePageClose(page)
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
  const re = new RegExp(config.script)

  page.on('request', async (request) => {
    const type = request.resourceType()
    const url = request.url()
    if (type === 'document' || type === 'xhr') {
      request.continue()
      return //Don't touch docuemnts
    }
    if (type === 'script') {
      const match = re.exec(url)
      if (type === 'script' && match) {
        widgetResult.siteId = [match[1]]
        widgetResult.multipleDetected = widgetResult.detected
        widgetResult.detected = true
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
      timeout: TIMEOUT
    })
  } catch (err) {
    if (!widgetResult.detected) {
      widgetResult.error = err.toString()
    }
    console.error('error detecting', err)
  } finally {
    schedulePageClose(page)
  }
  return widgetResult
}

function schedulePageClose(page: puppeteer.Page) {
  setTimeout(async () => {
    try {
      await page.close()
    } catch (err) {
      console.error('error closing', err)
    }
  })
}
