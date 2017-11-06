import * as fastify from 'fastify'
import {parse as parseUrl} from 'url'
import {detectCode} from './detect-code'

const api = fastify()
api.get('/', async function (request, reply) {
  const queryUrl = request.query.url
  if (queryUrl && parseUrl(queryUrl)) {
    reply.send(await detectCode(request.query.url))
  } else {
    reply.code(500).send({error: 'bad url parameter'})
  }
})

// Run the server!
api.listen(parseInt(process.env.PORT || '3000'), function (err) {
  if (err) throw err
  console.log(`server listening on ${api.server.address().port}`)
})
