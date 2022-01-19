import type { Single, Slide } from '$lib/score/beatmap'

// Types
export type LocaleStrings = {
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

const URL = '/api/library'

export async function list(): Promise<Item[]> {
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return await res.json() as Item[]
}

export async function create(item: Item): Promise<void> {
  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}
