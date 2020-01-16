"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options_1 = require("../options");
const common_1 = require("./common");
const api_1 = require("../api");
const { config } = require('../../package.json');
class Extractor {
    constructor() {
        this.images = [];
    }
    async processLoadRequest(request) {
        const type = request.resourceType();
        const url = request.url();
        // todo: limit individual requests with 5-10 sec
        if (common_1.ignoreRequest(request)) {
            console.debug(`request ${type} ignored - ${url}`);
            request.abort();
        }
        else if (Extractor.loadResourceTypes.indexOf(type) !== -1) {
            console.debug(`request ${type} continue - ${url}`);
            request.continue();
        }
        else {
            if (type === 'image' && !url.startsWith('data:')) {
                if (this.images.indexOf(url) === -1) {
                    this.images.push(url);
                }
            }
            // abort any other requests
            console.debug(`request ${type} abort - ${url}`);
            request.abort();
        }
    }
    processPage(page) {
        // todo: extract title, description, og:
        // todo: extract ld+json structured data
    }
    getItems() {
        return this.images.map(u => {
            return {
                'type': 'image',
                'scope': 'page',
                'value': u
            };
        });
    }
}
Extractor.loadResourceTypes = ['document', 'xhr', 'stylesheet', 'script', 'fetch'];
async function extract(url, browser) {
    const extractor = new Extractor();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', extractor.processLoadRequest.bind(extractor));
    try {
        console.time('loading');
        // prevent  webp
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15');
        await page.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        });
        const resp = await page.goto(url, {
            waitUntil: ['load', 'networkidle0'],
            timeout: options_1.TIMEOUT
        });
        if (resp) {
            console.timeEnd('loading');
            console.log(resp.status());
            if (resp.status() !== 200) {
                throw new api_1.RequestError(resp.status(), resp.statusText());
            }
        }
    }
    finally {
        common_1.schedulePageClose(page);
    }
    return extractor.getItems();
}
exports.extract = extract;
