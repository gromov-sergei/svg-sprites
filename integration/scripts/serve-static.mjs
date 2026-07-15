import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const [directory, portValue] = process.argv.slice(2)

if (!directory || !portValue) {
  throw new Error('Usage: node scripts/serve-static.mjs <directory> <port>')
}

const root = path.resolve(directory)
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
  const requestedPath = pathname.endsWith('/') ? `${pathname}index.html` : pathname
  const filePath = path.resolve(root, `.${requestedPath}`)

  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden')
    return
  }

  const resolvedPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    ? filePath
    : path.join(root, 'index.html')

  if (!fs.existsSync(resolvedPath)) {
    response.writeHead(404).end('Not found')
    return
  }

  response.setHeader('Content-Type', mimeTypes[path.extname(resolvedPath)] ?? 'application/octet-stream')
  fs.createReadStream(resolvedPath).pipe(response)
})

server.listen(Number(portValue), '127.0.0.1', () => {
  console.log(`Serving ${root} on http://127.0.0.1:${portValue}`)
})
