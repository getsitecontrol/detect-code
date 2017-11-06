"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify = require("fastify");
const url_1 = require("url");
const detect_code_1 = require("./detect-code");
async function createApi(browser) {
    const api = fastify();
    api.get('/', async function (request, reply) {
        const queryUrl = request.query.url;
        if (queryUrl && url_1.parse(queryUrl)) {
            reply.send(await detect_code_1.detectCode(request.query.url, browser));
        }
        else {
            reply.code(500).send({ error: 'bad url parameter' });
        }
    });
    return api;
}
// Run the server!
detect_code_1.startBrowser()
    .then(browser => createApi(browser))
    .then(api => api.listen(parseInt(process.env.PORT || '3000'), function (err) {
    if (err)
        throw err;
    console.log(`server listening on ${api.server.address().port}`);
}))
    .catch(err => console.error(err));
