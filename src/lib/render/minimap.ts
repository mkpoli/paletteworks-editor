import type { PositionManager } from '$lib/position'
import type {
  ICritical,
  IDirectional,
  Note,
  Single,
  Slide,
} from '$lib/score/beatmap'
import { Graphics, Container } from 'pixi.js'

export abstract class MinimapNoteRendererBase extends Graphics {
  arrows: (Note & IDirectional & ICritical)[] = []

  abstract drawNotes(
    position: PositionManager,
    singles: Single[],
    slides: Slide[]
  ): void
}

export abstract class MinimapRendererBase extends Container {
  notes: MinimapNoteRendererBase
  grid: Graphics
  screenArea: Graphics
  constructor(
    notes: MinimapNoteRendererBase,
    grid: Graphics,
    screenArea: Graphics
  ) {
    super()
    this.notes = notes
    this.grid = grid
    this.screenArea = screenArea

    this.addChild(this.screenArea)
    this.addChild(this.notes)
    this.addChild(this.grid)
  }
}
