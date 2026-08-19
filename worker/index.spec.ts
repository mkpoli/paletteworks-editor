import worker from './index'

class TestResponse {
  status: number

  constructor(_body: unknown, init: { status?: number } = {}) {
    this.status = init.status ?? 200
  }
}

;(global as unknown as { Response: typeof Response }).Response =
  TestResponse as unknown as typeof Response
;(global as unknown as { crypto: Crypto }).crypto = {
  getRandomValues<T extends ArrayBufferView | null>(array: T): T {
    if (array instanceof Uint8Array) array.fill(7)
    return array
  },
} as Crypto

function request(method = 'GET', body?: string): Request {
  const values = new Map<string, string>()
  if (body !== undefined) values.set('content-type', 'application/json')
  const bytes = body === undefined ? null : new TextEncoder().encode(body)
  let consumed = false
  return {
    url: 'https://paletteworks.mkpo.li/api/library',
    method,
    headers: {
      get(name: string) {
        return values.get(name.toLowerCase()) ?? null
      },
    },
    body: bytes
      ? {
          getReader() {
            return {
              async read() {
                if (consumed) return { done: true, value: undefined }
                consumed = true
                return { done: false, value: bytes }
              },
              async cancel() {},
            }
          },
        }
      : null,
  } as unknown as Request
}

function environment(
  options: { allowed?: boolean; rows?: Record<string, unknown>[] } = {}
) {
  const queries: { sql: string; bindings: unknown[] }[] = []
  const env = {
    DB: {
      prepare(sql: string) {
        const query = { sql, bindings: [] as unknown[] }
        queries.push(query)
        const statement = {
          bind(...bindings: unknown[]) {
            query.bindings = bindings
            return statement
          },
          async all() {
            return { results: options.rows ?? [] }
          },
          async run() {},
        }
        return statement
      },
    },
    ASSETS: { fetch: async () => new Response(null, { status: 404 }) },
    LIBRARY_WRITE_RATE_LIMITER: {
      limit: async () => ({ success: options.allowed ?? true }),
    },
  }
  return { env, queries }
}

describe('library API cost boundaries', () => {
  it('reads only the newest bounded page', async () => {
    const { env, queries } = environment()
    const response = await worker.fetch(request(), env)

    expect(response.status).toBe(200)
    expect(queries[0]).toEqual({
      sql: 'SELECT title_ja, description_ja, content_json FROM items ORDER BY rowid DESC LIMIT ?',
      bindings: [100],
    })
  })

  it('rejects a write after the rate ceiling', async () => {
    const { env, queries } = environment({ allowed: false })
    const response = await worker.fetch(request('POST', '{}'), env)

    expect(response.status).toBe(429)
    expect(queries).toHaveLength(0)
  })

  it('validates and stores one bounded item', async () => {
    const { env, queries } = environment()
    const response = await worker.fetch(
      request(
        'POST',
        JSON.stringify({
          title: { ja: '譜面' },
          description: { ja: '説明' },
          content: { singles: [] },
        })
      ),
      env
    )

    expect(response.status).toBe(201)
    expect(queries).toHaveLength(1)
    expect(queries[0].sql).toContain('INSERT INTO items')
    expect(queries[0].bindings[3]).toBe('譜面')
  })
})
