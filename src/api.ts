import * as bodyParser from 'body-parser'
import * as express from 'express'
import { Request, Response, Application } from 'express'
import { Server } from 'http'
import * as puppeteer from 'puppeteer'
import { Browser } from 'puppeteer'
import { parse as parseUrl } from 'url'
import { detectCode, detectCodeEval } from './browser-scripts/detect-code'
import { executablePath, TIMEOUT, VIEWPORT } from './options'
import { printHtml } from './browser-scripts/print-page'
import { makeScreenshot } from './browser-scripts/screenshot'
const pkg = require('../package.json')

export function createApi(browser: Browser):Application {
  const api = express()
  api.get('/detect-code', async function(
    { query: { url, eval: needEval = false } }: Request,
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
        reply.status(500).send({ error: err.message })
      }
    } else {
      reply.status(400).send({ error: 'bad url parameter' })
    }
  })

  api.post('/pdf', bodyParser.text({ type: 'text/html' }), async function(
    { body }: Request,
    reply: Response
  ) {
    if (body && typeof body === 'string') {
      try {
        const buffer = await printHtml(body, browser)
        reply.setHeader('content-type', 'application/pdf')
        reply.send(buffer)
      } catch (err) {
        reply.status(500).send({ error: err.message })
      }
    } else {
      reply
        .status(400)
        .send({ error: `bad html body. Use text/html content type` })
    }
  })

  api.get('/screenshot', async function(
    {
      query: { url, width = VIEWPORT.width, height = VIEWPORT.height },
    }: Request,
    reply: Response
  ) {
    if (url && parseUrl(url)) {
      try {
        const buffer = await makeScreenshot(url, width, height, browser)
        reply.setHeader('content-type', 'image/jpeg')
        reply.send(buffer)
      } catch (err) {
        reply.status(500).send({ error: err.message })
      }
    } else {
      reply.status(400).send({ error: 'bad url parameter' })
    }
  })
  /**
   * Helth check test
   */
  api.get('/test', async function(
    { query: { url = pkg.homepage } }: Request,
    reply: Response
  ) {
    try {
      const page = await browser.newPage()
      await page.goto(url, {
        waitUntil: ['load', 'networkidle0'],
        timeout: TIMEOUT,
      })
      reply.sendStatus(200)
    } catch (err) {
      reply.status(500).send({ error: err.message })
    }
  })
  return api
}
