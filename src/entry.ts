import * as fastify from 'fastify'
import {Browser} from 'puppeteer'
import {parse as parseUrl} from 'url'
import {detectCode, startBrowser} from './detect-code'

async function createApi (browser: Browser) {
  const api = fastify()
  api.get('/', async function (request, reply) {
    const queryUrl = request.query.url
    if (queryUrl && parseUrl(queryUrl)) {
      reply.send(await detectCode(request.query.url, browser))
    } else {
      reply.code(500).send({error: 'bad url parameter'})
    }
  })
  return api
}

// Run the server!
startBrowser()
  .then(browser => createApi(browser))
  .then(api => api.listen(parseInt(process.env.PORT || '3000'), function (err) {
    if (err) throw err
    console.log(`server listening on ${api.server.address().port}`)
  }))
  .catch(err => console.error(err))
