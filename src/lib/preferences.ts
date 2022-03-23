import { preferences as preferencesFromDatabase } from '$lib/database'
import { writable } from 'svelte/store'

// Also add UI in $lib/dialogs/PreferencesDialog.svelte
export const DEFAULT_PREFERENCES = {
  autosaveInterval: 10,
  scrollSpeed: 1,
  noteHeight: 0.85,
  minimapEnabled: true,
  laneWidth: 26,
  multiTapWarningEnabled: true,
  fileSaveName: '{project}-{datetime}.sus',
  autoDetectBPM: true
}

export type Preferences = typeof DEFAULT_PREFERENCES

export const preferences = writable<Preferences>(DEFAULT_PREFERENCES)

preferencesFromDatabase.subscribe((value) => {
  preferences.set({
    ...DEFAULT_PREFERENCES,
    ...value,
  })
})
