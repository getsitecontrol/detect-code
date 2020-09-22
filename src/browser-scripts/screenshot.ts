import {Browser, Viewport} from 'puppeteer'
import {TIMEOUT} from '../options'
import {error404} from "../api";
import {disableAllWidgets} from "./common";

const {config} = require('../../package.json')

export async function makeScreenshot(
    url: string,
    viewport: Viewport,
    widgets: boolean,
    browser: Browser
): Promise<Buffer> {
    const page = await browser.newPage()
    await page.setRequestInterception(true)
    if (!widgets) {
        disableAllWidgets(page)
    }
    const resp = await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: TIMEOUT
    })
    if (!resp.ok() && resp.status()!==304){
        console.log(resp)
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
