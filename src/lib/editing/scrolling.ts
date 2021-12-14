
export const SCROLL_MODES = [
  'page', 'smooth', 'none'
] as const
export type ScrollMode = typeof SCROLL_MODES[number]