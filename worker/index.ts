type Env = {
  DB: D1Database
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

type D1Database = {
  prepare(sql: string): {
    all(): Promise<{ results: Record<string, unknown>[] }>
    bind(...args: unknown[]): { run(): Promise<unknown> }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (url.pathname === '/api/library') {
      try {
        if (request.method === 'GET') {
          const res = await env.DB.prepare(
            'SELECT title_ja, description_ja, content_json FROM items'
          ).all()
          const items = res.results.map((row) => ({
            title: { ja: row.title_ja as string },
            description: { ja: row.description_ja as string },
            content: JSON.parse(row.content_json as string),
          }))
          return Response.json(items)
        }
        if (request.method === 'POST') {
          const item = (await request.json()) as {
            title?: { ja?: string }
            description?: { ja?: string }
            content: unknown
          }
          await env.DB.prepare(
            `INSERT INTO items (
              id, collection, ts_iso, title_ja, description_ja, content_json
            ) VALUES (?, ?, ?, ?, ?, ?)`
          )
            .bind(
              crypto.randomUUID(),
              'items',
              new Date().toISOString(),
              item.title?.ja ?? null,
              item.description?.ja ?? null,
              JSON.stringify(item.content)
            )
            .run()
          return Response.json(null)
        }
        return new Response(null, { status: 405 })
      } catch (error) {
        console.error('❌ API error:', error)
        return Response.json({ message: 'Internal Server Error' }, { status: 500 })
      }
    }
    return env.ASSETS.fetch(request)
  },
}
