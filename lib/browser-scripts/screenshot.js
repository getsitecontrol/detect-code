"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../options");
const api_1 = require("../api");
const common_1 = require("./common");
const { config } = require('../../package.json');
async function makeScreenshot(url, viewport, widgets, browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    if (!widgets) {
        common_1.disableAllWidgets(page);
    }
    await page.setViewport(viewport);
    const resp = await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: options_1.TIMEOUT
    });
    if (!resp.ok() && resp.status() !== 304) {
        console.log(resp);
        throw api_1.error404;
    }
    const buffer = await page.screenshot({
        type: 'png',
        fullPage: false
    });
    await page.close();
    return buffer;
}
exports.makeScreenshot = makeScreenshot;
