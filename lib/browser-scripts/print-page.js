"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../options");
const api_1 = require("../api");
const common_1 = require("./common");
async function printHtml(html, browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    common_1.disableAllWidgets(page);
    await page.setContent(html);
    return await print(page);
}
exports.printHtml = printHtml;
async function printUrl(url, browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    common_1.disableAllWidgets(page);
    const resp = await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: options_1.TIMEOUT
    });
    if (!resp.ok()) {
        throw api_1.error404;
    }
    return await print(page);
}
exports.printUrl = printUrl;
async function print(page) {
    await page.emulateMedia('print');
    const margin = '0.4in';
    const buffer = await page.pdf({
        format: 'A4',
        margin: { top: margin, bottom: margin, left: margin, right: margin },
    });
    await page.close();
    return buffer;
}
