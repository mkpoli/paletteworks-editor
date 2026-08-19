type Env = {
  DB: D1Database
  ASSETS: { fetch: (request: Request) => Promise<Response> }
  LIBRARY_WRITE_RATE_LIMITER: {
    limit(input: { key: string }): Promise<{ success: boolean }>
  }
}

type D1Statement = {
  all(): Promise<{ results: Record<string, unknown>[] }>
  bind(...args: unknown[]): D1Statement
  run(): Promise<unknown>
}

type D1Database = {
  prepare(sql: string): D1Statement
}

const MAX_LIBRARY_ITEMS = 100
const MAX_BODY_BYTES = 256 * 1024
const MAX_TITLE_LENGTH = 200
const MAX_DESCRIPTION_LENGTH = 2000

function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
}

async function limitedJson(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new RangeError('request body is too large')
  }
  if (!request.body) throw new SyntaxError('request body is empty')

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new RangeError('request body is too large')
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}

function libraryItem(value: unknown) {
  if (typeof value !== 'object' || value === null || !('content' in value))
    return null
  const item = value as {
    title?: { ja?: unknown }
    description?: { ja?: unknown }
    content: unknown
  }
  const title = item.title?.ja
  const description = item.description?.ja
  if (
    typeof title !== 'string' ||
    title.length < 1 ||
    title.length > MAX_TITLE_LENGTH
  )
    return null
  if (
    typeof description !== 'string' ||
    description.length < 1 ||
    description.length > MAX_DESCRIPTION_LENGTH
  )
    return null
  if (typeof item.content !== 'object' || item.content === null) return null
  return { title, description, contentJson: JSON.stringify(item.content) }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/library') {
      try {
        if (request.method === 'GET') {
          const res = await env.DB.prepare(
            'SELECT title_ja, description_ja, content_json FROM items ORDER BY rowid DESC LIMIT ?'
          )
            .bind(MAX_LIBRARY_ITEMS)
            .all()
          const items = res.results.map((row) => ({
            title: { ja: row.title_ja as string },
            description: { ja: row.description_ja as string },
            content: JSON.parse(row.content_json as string),
          }))
          return json(items, 200, {
            'Cache-Control': 'public, max-age=60, s-maxage=300',
          })
        }
        if (request.method === 'POST') {
          if (
            !request.headers
              .get('content-type')
              ?.toLowerCase()
              .startsWith('application/json')
          ) {
            return json({ message: 'Expected JSON' }, 415)
          }
          const key = request.headers.get('cf-connecting-ip') ?? 'unknown'
          const { success } = await env.LIBRARY_WRITE_RATE_LIMITER.limit({
            key,
          })
          if (!success)
            return json({ message: 'Too many requests' }, 429, {
              'Retry-After': '60',
            })

          let input: unknown
          try {
            input = await limitedJson(request)
          } catch (error) {
            return json(
              {
                message:
                  error instanceof RangeError
                    ? 'Request body is too large'
                    : 'Invalid JSON',
              },
              error instanceof RangeError ? 413 : 400
            )
          }
          const item = libraryItem(input)
          if (!item) return json({ message: 'Invalid library item' }, 400)

          await env.DB.prepare(
            `INSERT INTO items (
              id, collection, ts_iso, title_ja, description_ja, content_json
            ) VALUES (?, ?, ?, ?, ?, ?)`
          )
            .bind(
              randomId(),
              'items',
              new Date().toISOString(),
              item.title,
              item.description,
              item.contentJson
            )
            .run()
          return json(null, 201)
        }
        return json({ message: 'Method Not Allowed' }, 405, {
          Allow: 'GET, POST',
        })
      } catch (error) {
        console.error('❌ API error:', error)
        return json({ message: 'Internal Server Error' }, 500)
      }
    }
    return env.ASSETS.fetch(request)
  },
}
