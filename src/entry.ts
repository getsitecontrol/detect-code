import * as express from 'express'
import { Browser } from 'puppeteer'
import { parse as parseUrl } from 'url'
import { detectCode, detectCodeEval } from './detect-code'
import { Server } from 'http'
import * as puppeteer from 'puppeteer'
import { executablePath, TIMEOUT } from './options';
import { printHtml } from './print-page';
import {Response,Request} from 'express'
import * as bodyParser from 'body-parser'

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
  api.get('/', async function(request:Request, reply:Response) {
    const queryUrl = request.query.url
    const needEval = request.query.eval
    if (queryUrl && parseUrl(queryUrl)) {
      try {
        const codeResult = await (needEval ? detectCodeEval : detectCode)(
          request.query.url,
          browser
        )
        reply.send(codeResult)
      } catch (err) {
        console.error(err)
        reply.status(500).send({ error: err.message })
      }
    } else {
      reply.status(500).send({ error: 'bad url parameter' })
    }
  })

  api.post('/print', bodyParser.text(), async function(request:Request, reply:Response) {
    const queryHtml = request.body
    console.log(queryHtml)
    if (queryHtml) {
      try {
        const buffer = await printHtml(
          queryHtml,
          browser
        )
        reply.setHeader('content-type','application/pdf')
        reply.send(buffer)
      } catch (err) {
        console.error(err)
        reply.status(500).send({ error: err.message })
      }
    } else {
      reply.status(400).send({ error: 'bad html parameter' })
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
