import * as fastify from 'fastify'
import { Browser } from 'puppeteer'
import { parse as parseUrl } from 'url'
import { detectCode, startBrowser } from './detect-code'
const pkg = require('../package.json')

async function createApi(browser: Browser) {
  const api = fastify()
  api.get('/', async function(request, reply) {
    const queryUrl = request.query.url
    if (queryUrl && parseUrl(queryUrl)) {
      try {
        const codeResult = await detectCode(request.query.url, browser)
        reply.send(codeResult)
      } catch (err) {
        console.error(err)
        reply.code(500).send({ error: err.message })
      }
    } else {
      reply.code(500).send({ error: 'bad url parameter' })
    }
  })
  return api
}

// Run the server!
const port = parseInt(process.env.PORT || '3000')
startBrowser()
  .then(browser => createApi(browser))
  .then(api =>
    api.listen(port, function(err) {
      if (err) throw err
      console.log(`server ${pkg.version} listening on ${port}`)
    })
  )
  .catch(err => console.error(err))
