"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const url_1 = require("url");
const detect_code_1 = require("./browser-scripts/detect-code");
const options_1 = require("./options");
const print_page_1 = require("./browser-scripts/print-page");
const screenshot_1 = require("./browser-scripts/screenshot");
const pkg = require('../package.json');
function createApi(browser) {
    const api = express();
    api.get('/detect-code', async function ({ query: { url, eval: needEval = false } }, reply) {
        if (url && url_1.parse(url)) {
            try {
                const codeResult = await (needEval ? detect_code_1.detectCodeEval : detect_code_1.detectCode)(url, browser);
                reply.send(codeResult);
            }
            catch (err) {
                reply.status(500).send({ error: err.message });
            }
        }
        else {
            reply.status(400).send({ error: 'bad url parameter' });
        }
    });
    api.post('/pdf', bodyParser.text({ type: 'text/html' }), async function ({ body }, reply) {
        if (body && typeof body === 'string') {
            try {
                const buffer = await print_page_1.printHtml(body, browser);
                reply.setHeader('content-type', 'application/pdf');
                reply.send(buffer);
            }
            catch (err) {
                reply.status(500).send({ error: err.message });
            }
        }
        else {
            reply
                .status(400)
                .send({ error: `bad html body. Use text/html content type` });
        }
    });
    api.get('/screenshot', async function ({ query: { url, width = options_1.VIEWPORT.width, height = options_1.VIEWPORT.height }, }, reply) {
        if (url && url_1.parse(url)) {
            try {
                const buffer = await screenshot_1.makeScreenshot(url, width, height, browser);
                reply.setHeader('content-type', 'image/jpeg');
                reply.send(buffer);
            }
            catch (err) {
                reply.status(500).send({ error: err.message });
            }
        }
        else {
            reply.status(400).send({ error: 'bad url parameter' });
        }
    });
    /**
     * Helth check test
     */
    api.get('/test', async function ({ query: { url = pkg.homepage } }, reply) {
        try {
            const page = await browser.newPage();
            await page.goto(url, {
                waitUntil: ['load', 'networkidle0'],
                timeout: options_1.TIMEOUT,
            });
            reply.sendStatus(200);
        }
        catch (err) {
            reply.status(500).send({ error: err.message });
        }
    });
    return api;
}
exports.createApi = createApi;
