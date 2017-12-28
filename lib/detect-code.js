"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const TIMEOUT = parseInt(process.env.TIMEOUT || '20000');
async function startBrowser() {
    return await puppeteer.launch({
        ignoreHTTPSErrors: true,
        dumpio: false,
        headless: true,
        timeout: TIMEOUT,
        userDataDir: '/tmp/user-data',
        args: [
            '--disable-gpu',
            '--no-sandbox',
            '--window-size=1280x1696',
            '--hide-scrollbars',
            '--v=99',
            '--single-process',
            '--data-path=/tmp/data-path',
            '--ignore-certificate-errors',
            '--homedir=/tmp',
            '--disk-cache-dir=/tmp/cache-dir',
        ],
    });
}
exports.startBrowser = startBrowser;
async function detectCode(url, browser) {
    const widgetResult = {
        detected: false,
        multipleDetected: false,
        siteId: []
    };
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    let pageClosed = false;
    page.on('request', async (request) => {
        const type = request.resourceType;
        if (type === 'document') {
            request.continue();
            return; //Don't touch docuemnts
        }
        if (type === 'script') {
            let match;
            if (type === 'script' && (match = /widgets\.getsitecontrol\.com\/(\d+?)\/script\.js/.exec(request.url))) {
                widgetResult.multipleDetected = widgetResult.detected;
                widgetResult.detected = true;
                widgetResult.siteId.push(parseInt(match[1]));
                setImmediate(async function () {
                    try {
                        await page.goBack();
                        await page.close();
                        pageClosed = true;
                    }
                    catch (err) {
                        console.error('failed to close page', err);
                    }
                });
            }
            if (!widgetResult.detected) {
                request.continue();
                return;
            }
        }
        //Abort all other
        request.abort();
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    if (!pageClosed) {
        await page.close();
    }
    return widgetResult;
}
exports.detectCode = detectCode;
