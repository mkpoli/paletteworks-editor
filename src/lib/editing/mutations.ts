import type { Note, Single, Slide, SlideNote, SlideStep } from '$lib/score/beatmap'

export abstract class Mutation {
  name: string
  size: number
  type: string
  constructor() {
    this.name = '更新'
    this.size = 0
    this.type = 'ノーツ'
  }
  abstract exec(): any
  abstract undo(): any
  toString(): string {
    return `${this.size} ${this.type}を${this.name}`
  }
}

export abstract class BPMMutation extends Mutation {
  bpms: Map<number, number>
  tick: number
  constructor(bpms: Map<number, number>, tick: number) {
    super()
    this.name = '更新'
    this.size = 1
    this.type = 'BPM'
    this.bpms = bpms
    this.tick = tick
  }  
}

export class AddBPM extends BPMMutation {
  newValue: number
  constructor(bpms: Map<number, number>, tick: number, value: number) {
    super(bpms, tick)
    this.name = '追加'
    this.newValue = value
  }
  exec(): Map<number, number>  {
    return this.bpms.set(this.tick, this.newValue)
  }
  undo(): Map<number, number> {
    this.bpms.delete(this.tick)
    return this.bpms
  }
}

export class SetBPM extends BPMMutation {
  oldValue: number
  newValue: number
  constructor(bpms: Map<number, number>, tick: number, value: number) {
    super(bpms, tick)
    this.name = '設定'
    this.oldValue = bpms.get(tick)!
    this.newValue = value
  }
  exec(): Map<number, number> {
    return this.bpms.set(this.tick, this.newValue)
  }
  undo(): Map<number, number> {
    return this.bpms.set(this.tick, this.oldValue)
  }
}

export class RemoveBPM extends BPMMutation {
  oldValue: number
  constructor(bpms: Map<number, number>, tick: number) {
    super(bpms, tick)
    this.name = '削除'
    this.oldValue = bpms.get(tick)!
  }
  exec(): Map<number, number> {
    this.bpms.delete(this.tick)
    return this.bpms
  }
  undo(): Map<number, number> {
    return this.bpms.set(this.tick, this.oldValue)
  }
}

export abstract class SingleMutation extends Mutation {
  singles: Single[]
  constructor(singles: Single[]) {
    super()
    this.singles = singles
  }

  abstract exec(): Single[]
  abstract undo(): Single[]
}

export class AddSingles extends SingleMutation {
  newNotes: Single[]
  constructor(singles: Single[], newNotes: Single[]) {
    super(singles)
    this.newNotes = newNotes
    this.name = '追加'
    this.size = newNotes.length
  }

  exec() {
    return [...this.singles, ...this.newNotes.filter((note) => !this.singles.includes(note))]
  }

  undo() {
    return this.singles.filter((note) => !this.newNotes.includes(note))
  }
}

export class UpdateSingle extends SingleMutation {
  note: Single
  modification: Partial<Single>
  oldNote: Partial<Single>
  constructor(singles: Single[], note: Single, modification: Partial<Single>) {
    super(singles)
    this.size = 1
    this.note = note
    this.modification = modification
    this.oldNote = Object.fromEntries(Object.keys(modification).map((key) => [key, this.note[key as keyof Single]]))
    console.log(this.oldNote)
  }

  exec() {
    Object.assign(this.note, this.modification)
    return this.singles
  }

  undo() {
    Object.assign(this.note, this.oldNote)
    return this.singles
  }
}

export class RemoveSingles extends SingleMutation {
  targetNotes: Single[]
  constructor(singles: Single[], oldNotes: Single[]) {
    super(singles)
    this.name = '削除'
    this.size = oldNotes.length
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

  abstract exec(): Slide[]
  abstract undo(): Slide[]
}

export class AddSlides extends SlideMutation {
  newSlides: Slide[]
  constructor(slides: Slide[], newSlides: Slide[]) {
    super(slides)
    this.newSlides = newSlides
    this.type = `スライド`
    this.name = `追加`
    this.size = newSlides.length
  }

  exec() {
    return [...this.slides, ...this.newSlides.filter((slide) => !this.slides.includes(slide))]
  }

  undo() {
    return this.slides.filter((slide) => !this.newSlides.includes(slide))
  }
}

export class RemoveSlideSteps extends SlideMutation {
  slideStepsLocation: Map<SlideStep, Slide>
  constructor(slides: Slide[], oldSteps: SlideStep[]) {
    super(slides)
    this.type = 'スライドステップ'
    this.name = '削除'
    this.size = oldSteps.length
    this.slideStepsLocation = new Map<SlideStep, Slide>()
    oldSteps.forEach((oldStep) => {
      this.slideStepsLocation.set(oldStep, this.slides.find(({ steps }) => steps.includes(oldStep))!)
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
    this.type = 'スライド'
    this.name = '削除'
    this.size = oldSlides.length
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

export class UpdateSlideNote extends SlideMutation {
  targetNote: SlideNote
  modification: Partial<SlideNote>
  originalData: Partial<SlideNote>
  constructor(slides: Slide[], targetNote: SlideNote, modification: Partial<SlideNote>) {
    super(slides)
    this.targetNote = targetNote
    this.modification = modification
    this.type = 'スライド'
    this.size = 1
    this.originalData = Object.fromEntries(Object.keys(modification).map((key) => [key, this.targetNote[key as keyof SlideNote]]))
  }

  exec() {
    Object.assign(this.targetNote, this.modification)
    return this.slides
  }
  
  undo() {
    Object.assign(this.targetNote, this.originalData)
    return this.slides
  }
}

export class UpdateSlideNotes extends SlideMutation {
  modifications: Map<SlideNote, Partial<SlideNote>>
  originalDatas: Map<SlideNote, Partial<SlideNote>>
  constructor(slides: Slide[], modifications: Map<SlideNote, Partial<SlideNote>>) {
    super(slides)
    this.type = 'スライドノーツ'
    this.size = modifications.size
    this.modifications = modifications
    this.originalDatas = new Map([...modifications.entries()].map(([target, modification]) => 
      [target, Object.fromEntries(Object.keys(modification).map((key) => [key, target[key as keyof SlideNote]]))]
    ))
  }

  exec() {
    this.modifications.forEach((modification, target) => {
      Object.assign(target, modification)
    })
    return this.slides
  }

  undo() {
    this.originalDatas.forEach((originalData, target) => {
      Object.assign(target, originalData)
    })
    return this.slides
  }
}

export class UpdateSlide extends SlideMutation {
  targetSlide: Slide
  modification: Partial<Slide>
  originalData: Partial<Slide>
  constructor(slides: Slide[], targetSlide: Slide, modification: Partial<Slide>) {
    super(slides)
    this.type = 'スライド'
    this.size = 1
    this.targetSlide = targetSlide
    this.modification = modification
    this.originalData = Object.fromEntries(Object.keys(modification).map((key) => [key, this.targetSlide[key as keyof Slide]]))
  }
  
  exec() {
    Object.assign(this.targetSlide, this.modification)
    return this.slides
  }
  
  undo() {
    Object.assign(this.targetSlide, this.originalData)
    return this.slides
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
  constructor(singles: Single[], slides: Slide[], notes: Note[], name: string) {
    super(singles, slides)

    this.name = name
    this.size = notes.length

    const selectedSingles = this.singles.filter((note) => notes.includes(note))
    this.removeSingles = new RemoveSingles(singles, selectedSingles)

    const { markedSlides, slideSteps } = slides.reduce(({ markedSlides, slideSteps }, slide) => {
      const { head, tail, steps } = slide

      if (notes.some((note) => head === note || tail === note)) {
        markedSlides.push(slide)
      }

      notes
        .filter(note => steps.includes(note as SlideStep))
        .forEach(note => slideSteps.push(note as SlideStep))
      return { markedSlides, slideSteps }
    }, { markedSlides: [], slideSteps: [] } as { markedSlides: Slide[], slideSteps: SlideStep[] })
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

export class BatchAdd extends BatchMutation {
  addSingles: AddSingles
  addSlides: AddSlides

  constructor(singles: Single[], slides: Slide[], newSingles: Single[], newSlides: Slide[]) {
    super(singles, slides)
    this.addSingles = new AddSingles(singles, newSingles)
    this.addSlides = new AddSlides(slides, newSlides)

    this.name = '追加'
    this.size = newSingles.length + newSlides.length
  }

  exec(): { singles: Single[], slides: Slide[] } {
    this.singles = this.addSingles.exec()
    this.slides = this.addSlides.exec()
    return { singles: this.singles, slides: this.slides }
  }

  undo(): { singles: Single[], slides: Slide[] } {
    this.slides = this.addSlides.undo()
    this.singles = this.addSingles.undo()
    return { singles: this.singles, slides: this.slides }
  }
}

export class BatchUpdate extends BatchMutation {
  modifications: Map<Note, Partial<Note>>
  originalDatas: Map<Note, Partial<Note>>

  constructor(singles: Single[], slides: Slide[], modifications: Map<Note, Partial<Note>>, originalDatas: Map<Note, Partial<Note>>, name: string) {
    super(singles, slides)
    this.modifications = modifications
    this.originalDatas = originalDatas

    this.name = name
    this.size = modifications.size
  }

  exec() {
    this.modifications.forEach((modification, note) => {
      Object.assign(note, modification)
    })
    return { singles: this.singles, slides: this.slides }
  }

  undo() {
    this.originalDatas.forEach((originalData, note) => {
      Object.assign(note, originalData)
    })
    return { singles: this.singles, slides: this.slides }
  }
}