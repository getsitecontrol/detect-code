import * as bodyParser from 'body-parser'
import * as express from 'express'
import {Request, Response, Application} from 'express'
import {Browser, Viewport} from 'puppeteer'
import {parse as parseUrl} from 'url'
import {detectCode, detectCodeEval} from './browser-scripts/detect-code'
import {TIMEOUT, VIEWPORT} from './options'
import {printHtml} from './browser-scripts/print-page'
import {makeScreenshot} from './browser-scripts/screenshot'
import {extract} from './browser-scripts/extract'

const pkg = require('../package.json')
export const error404 = new Error()

export class RequestError extends Error {
    public code: number

    constructor(code: number, message: string) {
        if (!message) {
            message = `Request failed with code ${code}`
        }
        super(message);
        this.code = code
    }

}

export function createApi(browser: Browser): Application {
    const api = express()
    api.get('/detect-code', async function (
        {query: {url, eval: needEval = false}}: Request,
        reply: Response
    ) {
        if (url && parseUrl(url)) {
            try {
                const codeResult = await (needEval ? detectCodeEval : detectCode)(
                    url,
                    browser
                )
                reply.send(codeResult)
            } catch (err) {
                reply.status(err.code || 500).send({error: err.message})
            }
        } else {
            reply.status(400).send({error: 'bad url parameter'})
        }
    })

    api.get('/extract', async function (
        {query: {url,}}: Request,
        reply: Response
    ) {
        if (url && parseUrl(url)) {
            try {
                reply.send(await extract(url, browser))
            } catch (err) {

                reply.status(err.code || 500).send({error: err.message})
            }
        } else {
            reply.status(400).send({error: 'bad url parameter'})
        }
    })

    api.post('/pdf', bodyParser.text({type: 'text/html'}), async function (
        {body}: Request,
        reply: Response
    ) {
        if (body && typeof body === 'string') {
            try {
                const buffer = await printHtml(body, browser)
                reply.setHeader('content-type', 'application/pdf')
                reply.send(buffer)
            } catch (err) {
                reply.status(err.code || 500).send({error: err.message})
            }
        } else {
            reply
                .status(400)
                .send({error: `bad html body. Use text/html content type`})
        }
    })

    api.get('/screenshot', async function (
        {
            query: {
                url,
                width = VIEWPORT.width,
                height = VIEWPORT.height,
                scale = '1',
                mobile,
                widgets = 'false'
            },
        }: Request,
        reply: Response
    ) {
        if (url && parseUrl(url)) {
            try {
                const viewport: Viewport = {
                    width: parseInt(width),
                    height: parseInt(height),
                    deviceScaleFactor: parseFloat(scale)
                }
                if (mobile == 'true') {
                    viewport.isMobile = true
                    viewport.hasTouch = true
                }
                const buffer = await makeScreenshot(url,
                    viewport,
                    widgets == 'true',
                    browser)
                reply.setHeader('content-type', 'image/png')
                reply.send(buffer)
            } catch (err) {
                if (err == error404) {
                    reply.status(404).send()
                } else {
                    reply.status(500).send({error: err.message})
                }
            }
        } else {
            reply.status(400).send({error: 'bad url parameter'})
        }
    })
    /**
     * Helth check test
     */
    api.get('/test', async function (
        {query: {url = pkg.homepage}}: Request,
        reply: Response
    ) {
        try {
            const page = await browser.newPage()
            await page.goto(url, {
                waitUntil: ['load', 'networkidle0'],
                timeout: TIMEOUT,
            })
            await page.close()
            reply.sendStatus(200)
        } catch (err) {
            reply.status(500).send({error: err.message})
        }
    })
    return api
}
