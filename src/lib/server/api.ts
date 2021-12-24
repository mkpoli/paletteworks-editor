import type { Single, Slide } from '$lib/score/beatmap'
import faunadb from 'faunadb'

const q = faunadb.query

type LocaleStrings = {
  [key: string]: string
}

export type Item = {
  title: LocaleStrings
  description: LocaleStrings
  content: {
    singles?: Single[]
    slides?: Slide[]
  }
}

const client = new faunadb.Client({ secret: process.env['FAUNA_ADMIN_KEY']! })

export async function list(): Promise<Item[]> {
  const result = await client.query(q.Map(
    q.Paginate(q.Match(q.Index('all_items'))),
    q.Lambda(x => q.Get(x))
    )
  ) as { data: any[] }
  if (!result.data) return []
  return result.data
    .map(({ data }) => data).filter((data) => data !== undefined)
}

export async function create(item: Item) {
  await client.query(
    q.Create(q.Collection('items'), {
      data: item
    })
  )
}
