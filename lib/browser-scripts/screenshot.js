"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../options");
async function makeScreenshot(url, width, height, browser) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        //Disable runtime by emulating already loaded
        window['_gscq'] = window['_gscq'] || [];
        window['_gscq'].loaded = 1;
        window['gscwidgets'] = {
            start: () => null,
            runtime: {
                destroy: function () { },
            },
        };
    });
    await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: options_1.TIMEOUT,
    });
    await page.setViewport({ width, height });
    const buffer = await page.screenshot({
        type: 'png',
        fullPage: false
    });
    await page.close();
    return buffer;
}
exports.makeScreenshot = makeScreenshot;
