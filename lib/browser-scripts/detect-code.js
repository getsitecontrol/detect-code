"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../options");
const { config } = require('../../package.json');
async function detectCodeEval(url, browser) {
    const widgetResult = {
        detected: false,
        multipleDetected: false,
        siteId: [],
    };
    const page = await browser.newPage();
    try {
        const hookName = `hookWidgets${Date.now()}`;
        await page.exposeFunction(hookName, (...args) => {
            const [runtimeSettings, siteId] = args;
            widgetResult.siteId = [...widgetResult.siteId, siteId]; //args.length
            widgetResult.multipleDetected = widgetResult.detected;
            widgetResult.detected = true;
            widgetResult.activeWidgets = runtimeSettings.widgets.reduce((res, w) => (w.disabled ? 0 : 1) + res, 0);
        });
        await page.evaluateOnNewDocument((hookName, prefix) => {
            window[prefix] = {
                start: (...args) => {
                    window[hookName](...args);
                    window[`${hookName}Done`] = true;
                },
                runtime: {
                    destroy: function () { }
                }
            };
        }, hookName, config.prefix);
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: options_1.TIMEOUT
        });
        await page.waitForFunction(`window.${hookName}Done === true`, {
            polling: 100,
            timeout: options_1.TIMEOUT
        });
    }
    catch (err) {
        if (!widgetResult.detected) {
            widgetResult.error = err.toString();
        }
        console.error('error detecting eval', err);
    }
    finally {
        schedulePageClose(page);
    }
    return widgetResult;
}
exports.detectCodeEval = detectCodeEval;
async function detectCode(url, browser) {
    let widgetResult = {
        detected: false,
        multipleDetected: false,
        siteId: [],
    };
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
        const type = request.resourceType();
        const url = request.url();
        if (type === 'document' || type === 'xhr') {
            request.continue();
            return; //Don't touch docuemnts
        }
        if (type === 'script') {
            if (type === 'script' && new RegExp(config.script).exec(url)) {
                widgetResult.multipleDetected = widgetResult.detected;
                widgetResult.detected = true;
            }
            if (!widgetResult.detected) {
                request.continue();
                return;
            }
        }
        //Abort all other
        request.abort();
    });
    try {
        await page.goto(url, {
            waitUntil: ['load', 'networkidle0'],
            timeout: options_1.TIMEOUT
        });
    }
    catch (err) {
        if (!widgetResult.detected) {
            widgetResult.error = err.toString();
        }
        console.error('error detecting', err);
    }
    finally {
        schedulePageClose(page);
    }
    return widgetResult;
}
exports.detectCode = detectCode;
function schedulePageClose(page) {
    setTimeout(async () => {
        try {
            await page.close();
        }
        catch (err) {
            console.error('error closing', err);
        }
    });
}
