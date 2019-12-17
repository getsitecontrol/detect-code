import {Browser, Viewport} from 'puppeteer'
import {TIMEOUT} from '../options'
import {error404} from "../api";

const {config} = require('../../package.json')

export async function makeScreenshot(
    url: string,
    viewport: Viewport,
    widgets: boolean,
    browser: Browser
): Promise<Buffer> {
    const page = await browser.newPage()

    if (!widgets) {
        // hide getsitecontrol widgets
        await page.evaluateOnNewDocument((prefix: string) => {
            //Disable runtime by emulating already loaded
            const jsonpFunction = `__${prefix}__l`
            window[jsonpFunction] = function () {
            }
            window[prefix] = window[prefix] || []
            window[prefix] = {
                start: () => null,
                runtime: {
                    destroy: function () {
                    }
                }
            }
        }, config.prefix)
    }
    const resp = await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: TIMEOUT
    })
    if (!resp.ok()){
        throw error404
    }
    await page.setViewport(viewport)
    const buffer = await page.screenshot({
        type: 'png',
        fullPage: false
    })
    await page.close()
    return buffer
}
