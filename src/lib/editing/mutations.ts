import type { Single, Slide } from '$lib/score/beatmap'

export abstract class Mutation {
  abstract exec()
  abstract undo()
}

export abstract class SingleMutation extends Mutation {
  singles: Single[]
  constructor(singles: Single[]) {
    super()
    this.singles = singles
  }
}

export abstract class SlideMutation extends Mutation {
  slides: Slide[]
  constructor(slides: Slide[]) {
    super()
    this.slides = slides
  }
}

// TODO: BPM Mutation...

export class AddSingle extends SingleMutation {
  newNote: Single
  constructor(singles: Single[], newNote: Single) {
    super(singles)
    this.newNote = newNote
  }

  exec() {
    return [...this.singles, this.newNote]
  }

  undo() {
    return this.singles.filter((note) => note !== this.newNote)
  }
}

export class UpdateSingle extends SingleMutation {
  note: Single
  modification: Partial<Single>
  oldNote: Partial<Single>
  constructor(singles: Single[], note: Single, modification: Partial<Single>) {
    super(singles)
    this.note = note
    this.modification = modification
    this.oldNote = Object.fromEntries(Object.keys(modification).map((key) => [key, this.note[key]]))
    console.log(this.oldNote)
  }

  exec() {
    Object.entries(this.modification).forEach(([key, value]) => {
      this.note[key] = value
    })
    return this.singles
  }

  undo() {
    Object.entries(this.oldNote).forEach(([key, value]) => {
      this.note[key] = value
    })
    return this.singles
  }
}

export class RemoveSingles extends SingleMutation {
  oldNotes: Single[]
  constructor(singles: Single[], oldNotes: Single[]) {
    super(singles)
    this.oldNotes = oldNotes
  }

  exec() {
    this.singles = this.singles.filter((note) => !this.oldNotes.includes(note))
    return this.singles
  }
  
  undo() {
    return [...this.singles, ...this.oldNotes]
  }
}