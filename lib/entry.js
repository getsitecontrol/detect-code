"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify = require("fastify");
const url_1 = require("url");
const detect_code_1 = require("./detect-code");
const api = fastify();
api.get('/', async function (request, reply) {
    const queryUrl = request.query.url;
    if (queryUrl && url_1.default.parse(queryUrl)) {
        reply.send(await detect_code_1.detectCode(request.query.url));
    }
    else {
        reply.code(500).send({ error: 'bad url parameter' });
    }
});
// Run the server!
api.listen(parseInt(process.env.PORT || '3000'), function (err) {
    if (err)
        throw err;
    console.log(`server listening on ${api.server.address().port}`);
});
