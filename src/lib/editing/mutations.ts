import type { Note, Single, Slide, SlideStep } from '$lib/score/beatmap'

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
  targetNotes: Single[]
  constructor(singles: Single[], oldNotes: Single[]) {
    super(singles)
    this.targetNotes = oldNotes
  }

  exec() {
    this.singles = this.singles.filter((note) => !this.targetNotes.includes(note))
    return this.singles
  }
  
  undo() {
    return [...this.singles, ...this.targetNotes]
  }
}

export abstract class SlideMutation extends Mutation {
  slides: Slide[]
  constructor(slides: Slide[]) {
    super()
    this.slides = slides
  }
}

export class RemoveSlideSteps extends SlideMutation {
  slideStepsLocation: Map<SlideStep, Slide>
  constructor(slides: Slide[], oldSteps: SlideStep[]) {
    super(slides)
    this.slideStepsLocation = new Map<SlideStep, Slide>()
    oldSteps.forEach((oldStep) => {
      this.slideStepsLocation.set(oldStep, this.slides.find(({ steps }) => steps.includes(oldStep)))
    })
  }
  
  exec() {
    this.slideStepsLocation.forEach((slide, oldStep) => {
      slide.steps = slide.steps.filter((step) => step !== oldStep)
    })
    return this.slides
  }
  
  undo() {
    this.slideStepsLocation.forEach((slide, oldStep) => {
      slide.steps.push(oldStep)
    })
    return this.slides
  }
}

export class RemoveSlides extends SlideMutation {
  targetSlides: Slide[]
  constructor(slides: Slide[], oldSlides: Slide[]) {
    super(slides)
    this.targetSlides = oldSlides
  }

  exec() {
    this.slides = this.slides.filter((slide) => !this.targetSlides.includes(slide))
    return this.slides
  }
  
  undo() {
    return [...this.slides, ...this.targetSlides]
  }
}

export abstract class BatchMutation extends Mutation implements SingleMutation, SlideMutation {
  singles: Single[]
  slides: Slide[]
  constructor(singles: Single[], slides: Slide[]) {
    super()
    this.singles = singles
    this.slides = slides
  }
}

export class BatchRemove extends BatchMutation {
  removeSingles: RemoveSingles
  removeSlides: RemoveSlides
  removeSlideSteps: RemoveSlideSteps
  constructor(singles: Single[], slides: Slide[], notes: Note[]) {
    super(singles, slides)

    const selectedSingles = this.singles.filter((note) => notes.includes(note))
    this.removeSingles = new RemoveSingles(singles, selectedSingles)

    const { markedSlides, slideSteps } = slides.reduce(({ markedSlides, slideSteps }, slide) => {
      const { head, tail, steps } = slide

      if (notes.some((note) => head === note || tail === note)) {
        markedSlides.push(slide)
      }

      notes
        .filter(note => steps.includes(note as SlideStep))
        .forEach(note => slideSteps.push(note))
      return { markedSlides, slideSteps }
    }, { markedSlides: [], slideSteps: [] })
    this.removeSlideSteps = new RemoveSlideSteps(slides, slideSteps)
    this.removeSlides = new RemoveSlides(slides, markedSlides)
  }

  exec(): { singles: Single[], slides: Slide[] } {
    this.singles = this.removeSingles.exec()
    this.slides = this.removeSlideSteps.exec()
    this.slides = this.removeSlides.exec()
    return { singles: this.singles, slides: this.slides }
  }

  undo(): { singles: Single[], slides: Slide[] } {
    this.slides = this.removeSlides.undo()
    this.slides = this.removeSlideSteps.undo()
    this.singles = this.removeSingles.undo()
    return { singles: this.singles, slides: this.slides }
  }
}