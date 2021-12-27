import type { Metadata, Score } from '$lib/score/beatmap'
export interface Project {
  id?: number
  name: string
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