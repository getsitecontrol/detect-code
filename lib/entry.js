"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const url_1 = require("url");
const detect_code_1 = require("./detect-code");
const pkg = require('../package.json');
async function createApi(browser) {
    const api = express();
    api.get('/', async function (request, reply) {
        const queryUrl = request.query.url;
        if (queryUrl && url_1.parse(queryUrl)) {
            try {
                const codeResult = await detect_code_1.detectCode(request.query.url, browser);
                reply.send(codeResult);
            }
            catch (err) {
                console.error(err);
                reply.status(500).send({ error: err.message });
            }
        }
        else {
            reply.status(500).send({ error: 'bad url parameter' });
        }
    });
    return api;
}
let server;
// Run the server!
const port = parseInt(process.env.PORT || '3000');
detect_code_1.startBrowser()
    .then(browser => createApi(browser))
    .then(api => server = api.listen(port, function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`server ${pkg.version} listening on ${port}`);
}))
    .catch(err => console.error(err));
process.on('SIGTERM', function onSigterm() {
    console.log(`server ${pkg.version} is shutting down`);
    server &&
        server.close(function () {
            process.exit(0);
        });
});
