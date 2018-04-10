"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function printHtml(html, browser) {
    const margin = '0.4in';
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.pdf({ format: 'A4', margin: { top: margin, bottom: margin, left: margin, right: margin } });
    await page.close();
    return buffer;
}
exports.printHtml = printHtml;
