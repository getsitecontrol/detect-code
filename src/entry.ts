import * as fastify from 'fastify'
import {detectCode} from './detect-code'

const api = fastify()
api.get('/', async function (request, reply) {
  reply.send(await detectCode(request.query.url))
})

// Run the server!
api.listen(parseInt(process.env.PORT || '3000'), function (err) {
  if (err) throw err
  console.log(`server listening on ${api.server.address().port}`)
})
