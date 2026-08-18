import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'

const docsPrefix = '/docs/crowd-cast'
const docsRoot = resolve('dist/docs/crowd-cast')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}

function serveBuiltDocs() {
  return {
    name: 'serve-built-crowd-cast-docs',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url, 'http://localhost').pathname

        if (pathname === docsPrefix) {
          response.statusCode = 308
          response.setHeader('Location', `${docsPrefix}/`)
          response.end()
          return
        }

        if (!pathname.startsWith(`${docsPrefix}/`)) {
          next()
          return
        }

        const relativePath = decodeURIComponent(pathname.slice(docsPrefix.length))
        let filePath = resolve(docsRoot, `.${relativePath}`)

        if (filePath !== docsRoot && !filePath.startsWith(`${docsRoot}${sep}`)) {
          response.statusCode = 403
          response.end('Forbidden')
          return
        }

        if (existsSync(filePath) && statSync(filePath).isDirectory()) {
          filePath = resolve(filePath, 'index.html')
        }

        if (!existsSync(filePath) || !statSync(filePath).isFile()) {
          filePath = resolve(docsRoot, '404.html')
          response.statusCode = 404
        }

        response.setHeader('Content-Type', contentTypes[extname(filePath)] || 'application/octet-stream')
        response.setHeader('Cache-Control', 'no-cache')
        createReadStream(filePath).pipe(response)
      })
    },
  }
}

export default defineConfig({
  plugins: [serveBuiltDocs(), react()],
  server: {
    host: '127.0.0.1',
  },
})
