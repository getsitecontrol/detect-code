"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../options");
const { config } = require('../../package.json');
async function makeScreenshot(url, width, height, browser) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((prefix) => {
        //Disable runtime by emulating already loaded
        const jsonpFunction = `__${prefix}__l`;
        window[jsonpFunction] = function () { };
        window[prefix] = window[prefix] || [];
        window[prefix] = {
            start: () => null,
            runtime: {
                destroy: function () { }
            }
        };
    }, config.prefix);
    await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: options_1.TIMEOUT
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
