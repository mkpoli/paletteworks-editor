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

// let fetch: (
//   input: RequestInfo,
//   init?: RequestInit | undefined
// ) => Promise<Response>

const PREFIX = 'https://paletteworks.mkpo.li/'
const LIBRARY_URL = '/api/library'

export async function list(): Promise<Item[]> {
  if (!window.__TAURI__) {
    const res = await fetch(LIBRARY_URL)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return (await res.json()) as Item[]
  } else {
    const { http } = await import('@tauri-apps/api')
    return (await http.fetch<Item[]>(new URL(LIBRARY_URL, PREFIX).href)).data
  }
}

export async function create(item: Item): Promise<void> {
  const res = await fetch(LIBRARY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
}
