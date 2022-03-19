import { writable } from 'svelte/store'

export const visibilitys = [
  'taps',
  'flicks',
  'slides',
  'slidesteps',
  'all',
] as const

export type VisibilityType = typeof visibilitys[number]

export const visibility = writable<Record<VisibilityType, boolean>>({
  taps: true,
  flicks: true,
  slides: true,
  slidesteps: true,
  all: true,
})
