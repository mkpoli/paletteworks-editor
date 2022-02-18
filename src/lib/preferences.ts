import { preferences as preferencesFromDatabase } from '$lib/database'
import { writable } from 'svelte/store'

// Also add UI in $lib/dialogs/PreferencesDialog.svelte
export const DEFAULT_PREFERENCES = {
  autosaveInterval: 10,
  scrollSpeed: 1,
  noteHeight: 1,
  minimapEnabled: true,
  laneWidth: 30,
  multiTapWarningEnabled: true,
}

export type Preferences = typeof DEFAULT_PREFERENCES

export const preferences = writable<Preferences>(DEFAULT_PREFERENCES)

preferencesFromDatabase.subscribe((value) => {
  preferences.set({
    ...DEFAULT_PREFERENCES,
    ...value
  })
})
