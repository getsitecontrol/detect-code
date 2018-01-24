"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify = require("fastify");
const url_1 = require("url");
const detect_code_1 = require("./detect-code");
const pkg = require('../package.json');
async function createApi(browser) {
    const api = fastify();
    api.get('/', async function (request, reply) {
        const queryUrl = request.query.url;
        if (queryUrl && url_1.parse(queryUrl)) {
            try {
                const codeResult = await detect_code_1.detectCode(request.query.url, browser);
                reply.send(codeResult);
            }
            catch (err) {
                console.error(err);
                reply.code(500).send({ error: err.message });
            }
        }
        else {
            reply.code(500).send({ error: 'bad url parameter' });
        }
    });
    return api;
}
let server;
// Run the server!
const port = parseInt(process.env.PORT || '3000');
detect_code_1.startBrowser()
    .then(browser => createApi(browser))
    .then(api => api.listen(port, function (err) {
    if (err)
        throw err;
    console.log(`server ${pkg.version} listening on ${port}`);
    server = api.server;
}))
    .catch(err => console.error(err));
process.on('SIGTERM', function onSigterm() {
    console.log(`server ${pkg.version} is shutting down`);
    server &&
        server.close(function () {
            process.exit(0);
        });
});
