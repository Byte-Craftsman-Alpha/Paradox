import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

async function parseJsonBody(req: any) {
  const method = (req.method || 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return undefined

  const chunks: Uint8Array[] = []
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: Uint8Array) => chunks.push(chunk))
    req.on('end', resolve)
    req.on('error', reject)
  })

  if (!chunks.length) return undefined
  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) return undefined

  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function json(res: any, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function localApiPlugin() {
  return {
    name: 'local-api-routes',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        try {
          const url = new URL(req.url || '/', 'http://localhost')
          const pathname = url.pathname.replace(/\/+$/, '') || '/'
          if (!pathname.startsWith('/api')) return next()

          const route = pathname === '/api' ? '/api/index' : pathname
          const routeParts = route.split('/').filter(Boolean)
          const candidates = [
            path.resolve(process.cwd(), `.${route}.js`),
          ]
          if (routeParts.length >= 3) {
            const dynamicParts = [...routeParts]
            dynamicParts[dynamicParts.length - 1] = '[action]'
            candidates.push(path.resolve(process.cwd(), `${dynamicParts.join(path.sep)}.js`))
          }

          const filePath = candidates.find((candidate) => fs.existsSync(candidate))
          if (!filePath) {
            return json(res, 404, { error: 'Not found' })
          }

          const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`)
          const handler = mod?.default
          if (typeof handler !== 'function') {
            return json(res, 500, { error: 'Invalid API handler export' })
          }

          const query: Record<string, string> = {}
          url.searchParams.forEach((value, key) => {
            query[key] = value
          })
          if (filePath.includes(`${path.sep}[action].js`) && routeParts.length >= 3) {
            query.action = routeParts[routeParts.length - 1]
          }

          const body = await parseJsonBody(req)
          const reqLike = {
            method: req.method,
            headers: req.headers || {},
            query,
            body,
          }

          const resLike = {
            setHeader: (name: string, value: string) => {
              res.setHeader(name, value)
              return resLike
            },
            status: (code: number) => {
              res.statusCode = code
              return resLike
            },
            json: (payload: unknown) => {
              if (!res.getHeader('Content-Type')) {
                res.setHeader('Content-Type', 'application/json')
              }
              res.end(JSON.stringify(payload))
              return resLike
            },
            end: (payload?: string) => {
              res.end(payload)
              return resLike
            },
          }

          await handler(reqLike, resLike)
          if (!res.writableEnded) res.end()
        } catch (error) {
          console.error('Local API middleware error:', error)
          if (!res.writableEnded) {
            json(res, 500, { error: 'Internal server error' })
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss(), localApiPlugin()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}
  return { plugins };
})
