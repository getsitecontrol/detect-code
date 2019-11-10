import * as puppeteer from 'puppeteer'
import {Browser} from 'puppeteer'
import {TIMEOUT} from '../options'
import {ignoreRequest, schedulePageClose} from "./common";

const {config} = require('../../package.json')

class Extractor {
    images: string[]

    constructor() {
        this.images = []
    }

    static loadResourceTypes = ['document', 'xhr', 'stylesheet', 'script', 'fetch']

    public async processLoadRequest(request: puppeteer.Request) {
        const type = request.resourceType()
        const url = request.url()
        // todo: limit individual requests with 5-10 sec
        if (ignoreRequest(request)) {
            console.debug(`request ${type} ignored - ${url}`)
            request.abort()
        } else if (Extractor.loadResourceTypes.indexOf(type) !== -1) {
            console.debug(`request ${type} continue - ${url}`)
            request.continue()
        } else {
            if (type === 'image' && !url.startsWith('data:')) {
                if (this.images.indexOf(url) === -1) {
                    this.images.push(url)
                }
            }
            // abort any other requests
            console.debug(`request ${type} abort - ${url}`)
            request.abort()
        }
    }

    public processPage(page: puppeteer.Page) {
        // todo: extract title, description, og:
        // todo: extract ld+json structured data
    }

    public getItems() {
        return this.images.map(u => {
            return {
                'type': 'image',
                'scope': 'page',
                'value': u
            }

        })
    }
}

export async function extract(
    url: string,
    browser: Browser
) {
    const extractor = new Extractor()
    const page = await browser.newPage()
    await page.setRequestInterception(true)

    page.on('request',
        extractor.processLoadRequest.bind(extractor))

    try {
        console.time('loading')
        const resp = await page.goto(url, {
            waitUntil: ['load', 'networkidle0'],
            timeout: TIMEOUT
        })
        console.timeEnd('loading')
        console.log(resp.status())
        if (resp.status() !== 200) {
            throw new Error(`Request failed, status=` + resp.status())
        }

    } finally {
        schedulePageClose(page)
    }
    return extractor.getItems()
}

