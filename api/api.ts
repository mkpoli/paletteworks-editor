import { createClient } from '@libsql/client/web'
import type { Single, Slide } from '$lib/score/beatmap'

type LocaleStrings = { [key: string]: string }

export type Item = {
  title: LocaleStrings
  description: LocaleStrings
  content: {
    singles?: Single[]
    slides?: Slide[]
  }
}

const client = createClient({
  url: process.env['TURSO_DATABASE_URL']!,
  authToken: process.env['TURSO_AUTH_TOKEN']!,
})

export async function list(): Promise<Item[]> {
  const res = await client.execute(
    'SELECT title_ja, description_ja, content_json FROM items'
  )

  return res.rows.map((row) => ({
    title: { ja: row.title_ja as string },
    description: { ja: row.description_ja as string },
    content: JSON.parse(row.content_json as string),
  }))
}

export async function create(item: Item) {
  await client.execute({
    sql: `
      INSERT INTO items (
        id, collection, ts_iso, title_ja, description_ja, content_json
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      crypto.randomUUID(),
      'items',
      new Date().toISOString(),
      item.title?.ja ?? null,
      item.description?.ja ?? null,
      JSON.stringify(item.content),
    ],
  })
}
