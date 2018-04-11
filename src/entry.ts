import * as bodyParser from 'body-parser'
import * as express from 'express'
import { Request, Response } from 'express'
import { Server } from 'http'
import * as puppeteer from 'puppeteer'
import { Browser } from 'puppeteer'
import { parse as parseUrl } from 'url'
import { detectCode, detectCodeEval } from './browser-scripts/detect-code'
import { executablePath, TIMEOUT, VIEWPORT } from './options'
import { printHtml } from './browser-scripts/print-page'
import { makeScreenshot } from './browser-scripts/screenshot';

const pkg = require('../package.json')

async function startBrowser() {
  console.log('starting ', executablePath)
  return await puppeteer.launch({
    executablePath,
    ignoreHTTPSErrors: true,
    dumpio: false,
    headless: true,
    timeout: TIMEOUT,
    userDataDir: '/tmp/user-data',
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280x1696', // Letter size
      '--hide-scrollbars',
      '--v=99',
      '--single-process',
      '--data-path=/tmp/data-path',
      '--ignore-certificate-errors', // Dangerous?
      '--homedir=/tmp',
      '--disk-cache-dir=/tmp/cache-dir',
    ],
  })
}

async function createApi(browser: Browser) {
  const api = express()
  api.get('/detect-code', async function(
    { query: { url, eval:needEval = false } }: Request,
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
    { query: { url, width = VIEWPORT.width, height = VIEWPORT.height } }: Request,
    reply: Response
  ) {
    if (url && parseUrl(url)) {
      try {
        const buffer = await makeScreenshot(
          url,
          width,
          height,
          browser
        )
        reply.setHeader('content-type', 'image/jpeg')
        reply.send(buffer)
      } catch (err) {
        reply.status(500).send({ error: err.message })
      }
    } else {
      reply.status(400).send({ error: 'bad url parameter' })
    }
  })

  return api
}

let server: Server
// Run the server!
const port = parseInt(process.env.PORT || '3000')
startBrowser()
  .then((browser) => createApi(browser))
  .then(
    (api) =>
      (server = api.listen(port, function(err) {
        if (err) {
          console.error(err)
          process.exit(1) 
        }
        console.log(`server ${pkg.version} listening on ${port}`)
      }))
  )
  .catch((err) => console.error(err))

process.on('SIGTERM', function onSigterm() {
  console.log(`server ${pkg.version} is shutting down`)
  server &&
    server.close(function() {
      process.exit(0)
    })
})
