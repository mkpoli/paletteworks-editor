import { writable } from 'svelte/store'
import type { Mutation } from '$lib/editing/mutations'

export const mutationHistory = writable<Mutation[]>([])
export const undoneHistory = writable<Mutation[]>([])
