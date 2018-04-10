"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const url_1 = require("url");
const detect_code_1 = require("./detect-code");
const puppeteer = require("puppeteer");
const options_1 = require("./options");
const print_page_1 = require("./print-page");
const bodyParser = require("body-parser");
const pkg = require('../package.json');
async function startBrowser() {
    console.log('starting ', options_1.executablePath);
    return await puppeteer.launch({
        executablePath: options_1.executablePath,
        ignoreHTTPSErrors: true,
        dumpio: false,
        headless: true,
        timeout: options_1.TIMEOUT,
        userDataDir: '/tmp/user-data',
        args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
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
async function createApi(browser) {
    const api = express();
    api.get('/', async function (request, reply) {
        const queryUrl = request.query.url;
        const needEval = request.query.eval;
        if (queryUrl && url_1.parse(queryUrl)) {
            try {
                const codeResult = await (needEval ? detect_code_1.detectCodeEval : detect_code_1.detectCode)(request.query.url, browser);
                reply.send(codeResult);
            }
            catch (err) {
                console.error(err);
                reply.status(500).send({ error: err.message });
            }
        }
        else {
            reply.status(500).send({ error: 'bad url parameter' });
        }
    });
    api.post('/print', bodyParser.text(), async function (request, reply) {
        const queryHtml = request.body;
        console.log(queryHtml);
        if (queryHtml) {
            try {
                const buffer = await print_page_1.printHtml(queryHtml, browser);
                reply.setHeader('content-type', 'application/pdf');
                reply.send(buffer);
            }
            catch (err) {
                console.error(err);
                reply.status(500).send({ error: err.message });
            }
        }
        else {
            reply.status(400).send({ error: 'bad html parameter' });
        }
    });
    return api;
}
let server;
// Run the server!
const port = parseInt(process.env.PORT || '3000');
startBrowser()
    .then((browser) => createApi(browser))
    .then((api) => (server = api.listen(port, function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`server ${pkg.version} listening on ${port}`);
})))
    .catch((err) => console.error(err));
process.on('SIGTERM', function onSigterm() {
    console.log(`server ${pkg.version} is shutting down`);
    server &&
        server.close(function () {
            process.exit(0);
        });
});
