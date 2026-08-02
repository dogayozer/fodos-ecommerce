const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

// cPanel Passenger production ortamında NODE_ENV'i production yapar
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    // URL'yi ayrıştır
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err
    console.log('> Server is ready on port ' + (process.env.PORT || 3000))
  })
})
