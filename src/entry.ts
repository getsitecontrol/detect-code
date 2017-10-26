import * as fastify from 'fastify'
import url from 'url'
import {detectCode} from './detect-code'

const api = fastify()
api.get('/', async function (request, reply) {
  const queryUrl = request.query.url
  if (queryUrl && url.parse(queryUrl)) {
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
