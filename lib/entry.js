"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const api_1 = require("./api");
const options_1 = require("./options");
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
            '--disk-cache-dir=/tmp/cache-dir'
        ],
    });
}
let server;
// Run the server!
const port = parseInt(process.env.PORT || '3000');
startBrowser()
    .then((browser) => api_1.createApi(browser))
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
