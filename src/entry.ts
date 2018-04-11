import { Server } from 'http'
import * as puppeteer from 'puppeteer'

import { createApi } from './api'
import { executablePath, TIMEOUT } from './options'

const pkg = require('../package.json')

async function startBrowser() {
  console.log('starting ', executablePath)
  return await puppeteer.launch({ 
    executablePath,
    ignoreHTTPSErrors: true,
    dumpio: false,
    headless: true,
    timeout: TIMEOUT,
    userDataDir: '/tmp/user-data',
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1280x1696', // Letter size
      '--hide-scrollbars',
      '--v=99',
      '--single-process',
      '--data-path=/tmp/data-path',
      '--ignore-certificate-errors', // Dangerous?
      '--homedir=/tmp',
      '--disk-cache-dir=/tmp/cache-dir',
    ],
  })
}

let server: Server
// Run the server!
const port = parseInt(process.env.PORT || '3000')
startBrowser()
  .then((browser) => createApi(browser))
  .then(
    (api) =>
      (server = api.listen(port, function(err) {
        if (err) {
          console.error(err)
          process.exit(1)
        }
        console.log(`server ${pkg.version} listening on ${port}`)
      }))
  )
  .catch((err) => console.error(err))

process.on('SIGTERM', function onSigterm() {
  console.log(`server ${pkg.version} is shutting down`)
  server &&
    server.close(function() {
      process.exit(0)
    })
})
