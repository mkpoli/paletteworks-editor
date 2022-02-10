import type { Metadata, Score } from '$lib/score/beatmap'
import { serialiseScore, deserialiseScore } from '$lib/score/beatmap'
export interface Project {
  id?: number
  name: string | null
  created: Date
  updated: Date
  metadata: Metadata
  score: Score
  preview: Blob
  music: File | null
}

export interface Preferences {
  key?: string
  value: unknown
}

import { Dexie, liveQuery } from 'dexie'

class Database extends Dexie {
  projects: Dexie.Table<Project, number>
  preferences: Dexie.Table<Preferences, string>
  constructor() {
    super('PaletteWorks')
    this.version(2).stores({
      projects: '++id,name,created,updated,metadata,score,music,preview',
      preferences: 'key,value'
    })
    this.projects = this.table('projects')
    this.preferences = this.table('preferences')
  }
}

export const db = new Database()

export const projects = liveQuery(async () => (await db.projects.toArray()).reverse())
export const preferences = liveQuery(async () => 
  Object.fromEntries((await db.preferences.toArray()).map(({ key, value }) => [key, value]))
)

import msgpack from 'msgpack-lite'

export async function seriliseProject(project: Project): Promise<Blob> {
  const {
    name,
    created,
    updated,
    metadata,
    score,
    preview,
    music
  } = project
  const data = msgpack.encode({
    version: 1,
    name,
    created: created.getTime(),
    updated: updated.getTime(),
    metadata,
    score: serialiseScore(score),
    preview: await preview.arrayBuffer(),
    music: music ? {
      data: await music.arrayBuffer(),
      name: music.name,
      type: music.type,
      lastModified: music.lastModified,
    } : null
  })
  return new Blob([data.buffer], { type: 'application/octet-binary' })
}

export async function deserialiseProject(blob: Blob): Promise<Project> {
  const data = msgpack.decode(new Uint8Array(await blob.arrayBuffer()))
  const {
    version,
    name,
    created,
    updated,
    metadata,
    score,
    preview,
    music
  } = data
  if (version !== 1) throw new Error('Unsupported version')
  return {
    name,
    created: new Date(created),
    updated: new Date(updated),
    metadata,
    score: deserialiseScore(score),
    preview: new Blob([preview], { type: 'application/octet-binary' }),
    music: music ? new File([music.data], music.name, { type: music.type, lastModified: music.lastModified }) : null
  }
}

export const PROJECT_FILE_EXTENSION = '.pws' // PaletteWorks Score File