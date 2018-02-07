import * as express from 'express'
import { Browser } from 'puppeteer'
import { parse as parseUrl } from 'url'
import { detectCode, startBrowser, detectCodeEval } from './detect-code'
import { Server } from 'http'
const pkg = require('../package.json')

async function createApi(browser: Browser) {
  const api = express()
  api.get('/', async function(request, reply) {
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
  return api
}

let server: Server
// Run the server!
const port = parseInt(process.env.PORT || '3000')
startBrowser()
  .then(browser => createApi(browser))
  .then(
    api =>
      (server = api.listen(port, function(err) {
        if (err) {
          console.error(err)
          process.exit(1)
        }
        console.log(`server ${pkg.version} listening on ${port}`)
      }))
  )
  .catch(err => console.error(err))

process.on('SIGTERM', function onSigterm() {
  console.log(`server ${pkg.version} is shutting down`)
  server &&
    server.close(function() {
      process.exit(0)
    })
})
