import { preferences as preferencesFromDatabase } from '$lib/database'
import { writable } from 'svelte/store'

export const DEFAULT_PREFERENCES = {
  autosaveInterval: 10,
  scrollSpeed: 1,
}

export type Preferences = typeof DEFAULT_PREFERENCES

export const preferences = writable<Preferences>(DEFAULT_PREFERENCES)

preferencesFromDatabase.subscribe((value) => {
  preferences.set({
    ...DEFAULT_PREFERENCES,
    ...value
  })
})