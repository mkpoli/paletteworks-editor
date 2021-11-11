import type { Metadata, Score } from '$lib/score/beatmap'
export interface Project {
  id?: number
  name: string
  created: Date
  updated: Date
  deleted: Date
  metadata: Metadata
  score: Score,
  preview: Blob
}

import { Dexie, liveQuery } from 'dexie'

class Database extends Dexie {
  projects: Dexie.Table<Project, number>
  constructor() {
    super('PaletteWorks')
    this.version(1).stores({
      projects: '++id,name,created,updated,deleted,metadata,score',
    })
    this.projects = this.table('projects')
  }
}

export const db = new Database()

// Projects as Store
export const projects = liveQuery(async () => await db.table('projects').toArray())