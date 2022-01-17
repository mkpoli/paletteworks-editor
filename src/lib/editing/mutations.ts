import type { Note, Single, Slide, SlideNote, SlideStep } from '$lib/score/beatmap'

import { LL } from '$i18n/i18n-svelte'

type TargetType = 'slide' | 'slidenote' | 'note' | 'bpm' | 'timeSignature'
type Operation = 'append' | 'delete' | 'update' | 'set' | 'cut' | 'flip' | 'move' | 'resize' | 'paste' | 'divide' | 'combine'

type Stringify = (amount: number, type: TargetType, operation: Operation) => string 

let stringify: Stringify

LL.subscribe((T) => {
  stringify = (amount, type, operation) =>
    T.editor.mutation.message({ amount: amount, type: T.editor.mutation.target[type](), operation: T.editor.mutation[operation]() })
})

export abstract class Mutation<T> {
  amount: number
  target: TargetType
  operation: Operation
  constructor() {
    this.operation = 'update'
    this.amount = 0
    this.target = 'note'
  }
  abstract exec(): T
  abstract undo(): T
  toString(): string {
    return stringify(this.amount, this.target, this.operation)
  }
}

// #region BPM Mutations

export abstract class BPMMutation extends Mutation<Map<number, number>> {
  bpms: Map<number, number>
  tick: number
  constructor(bpms: Map<number, number>, tick: number) {
    super()
    this.amount = 1
    this.target = 'bpm'
    this.bpms = bpms
    this.tick = tick
  }  
}

export class AddBPM extends BPMMutation {
  newValue: number
  constructor(bpms: Map<number, number>, tick: number, value: number) {
    super(bpms, tick)
    this.operation = 'append'
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
    this.operation = 'set'
    const oldValue = bpms.get(tick)
    if (!oldValue) throw new Error('Unexpected BPM not found')
    this.oldValue = oldValue
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
    this.operation = 'delete'
    const oldValue = bpms.get(tick)
    if (!oldValue) throw new Error('Unexpected BPM not found')
    this.oldValue = oldValue
  }
  exec(): Map<number, number> {
    this.bpms.delete(this.tick)
    return this.bpms
  }
  undo(): Map<number, number> {
    return this.bpms.set(this.tick, this.oldValue)
  }
}

// #endregion

// #region Single Mutations

export abstract class SingleMutation extends Mutation<Single[]> {
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
    this.operation = 'append'
    this.amount = newNotes.length
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
    this.amount = 1
    this.note = note
    this.modification = modification
    this.oldNote = Object.fromEntries(Object.keys(modification).map((key) => [key, this.note[key as keyof Single]]))
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
    this.operation = 'delete'
    this.amount = oldNotes.length
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

// #endregion

// #region Slide Mutations

export abstract class SlideMutation extends Mutation<Slide[]> {
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
    this.target = 'slide'
    this.operation = 'append'
    this.amount = newSlides.length
  }

  exec() {
    return [...this.slides, ...this.newSlides.filter((slide) => !this.slides.includes(slide))]
  }

  undo() {
    return this.slides.filter((slide) => !this.newSlides.includes(slide))
  }
}

export class RemoveSlides extends SlideMutation {
  targetSlides: Slide[]
  constructor(slides: Slide[], oldSlides: Slide[]) {
    super(slides)
    this.target = 'slide'
    this.operation = 'delete'
    this.amount = oldSlides.length
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

export class AddRemoveSlides extends SlideMutation {
  additions: Slide[]
  deletions: Slide[]

  constructor(slides: Slide[], additions: Slide[], deletions: Slide[], amount: number, operation: Operation) {
    super(slides)
    this.target = 'slide'
    this.operation = operation
    this.amount = amount

    this.additions = additions
    this.deletions = deletions
  }

  exec() {
    return [
      ...this.slides.filter((predicate) => !this.deletions.includes(predicate)),
      ...this.additions.filter(predicate => !this.slides.includes(predicate))
    ]
  }

  undo() {
    return [
      ...this.slides.filter((predicate) => !this.additions.includes(predicate)),
      ...this.deletions.filter(predicate => !this.slides.includes(predicate))
    ]
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
    this.target = 'slidenote'
    this.amount = 1
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
    this.target = 'slidenote'
    this.amount = modifications.size
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
    this.target = 'slide'
    this.amount = 1
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

export class UpdateSlides extends SlideMutation {
  modifications: Map<Slide, Partial<Slide>>
  originalDatas: Map<Slide, Partial<Slide>>
  constructor(slides: Slide[], modifications: Map<Slide, Partial<Slide>>, originalDatas: Map<Slide, Partial<Slide>>) {
    super(slides)
    this.target = 'slide'
    this.amount = modifications.size
    this.modifications = modifications
    this.originalDatas = originalDatas
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

export class RemoveSlideSteps extends SlideMutation {
  slideStepsLocation: Map<SlideStep, Slide>
  constructor(slides: Slide[], oldSteps: SlideStep[]) {
    super(slides)
    this.target = 'slidenote'
    this.operation = 'delete'
    this.amount = oldSteps.length
    this.slideStepsLocation = new Map<SlideStep, Slide>()
    oldSteps.forEach((oldStep) => {
      const slide = this.slides.find(({ steps }) => steps.includes(oldStep))
      if (!slide) throw new Error(`Unexpected slide not found for step ${oldStep}`)
      this.slideStepsLocation.set(oldStep, slide)
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

// #endregion

// #region Batch-Mutations (Singles & Slides)

export abstract class BatchMutation extends Mutation<{ singles: Single[], slides: Slide[] }> {
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
  constructor(singles: Single[], slides: Slide[], notes: Note[], operation: Operation) {
    super(singles, slides)

    this.operation = operation
    this.amount = notes.length

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

  constructor(singles: Single[], slides: Slide[], newSingles: Single[], newSlides: Slide[], operation: Operation = 'append') {
    super(singles, slides)
    this.addSingles = new AddSingles(singles, newSingles)
    this.addSlides = new AddSlides(slides, newSlides)

    this.operation = operation
    this.amount = newSingles.length + newSlides.length
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

  constructor(singles: Single[], slides: Slide[], modifications: Map<Note, Partial<Note>>, originalDatas: Map<Note, Partial<Note>>, operation: Operation) {
    super(singles, slides)
    this.modifications = modifications
    this.originalDatas = originalDatas

    this.operation = operation
    this.amount = modifications.size
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

export class BatchUpdateCombinated extends BatchMutation {
  batchUpdate: BatchUpdate
  updateSlides: UpdateSlides

  constructor(singles: Single[], slides: Slide[], noteModifications: Map<Note, Partial<Note>>, noteOriginalDatas: Map<Note, Partial<Note>>, slideModifications: Map<Slide, Partial<Slide>>, slideOriginalDatas: Map<Slide, Partial<Slide>>, operation: Operation) {
    super(singles, slides)

    this.operation = operation
    this.amount = noteModifications.size + slideModifications.size

    this.batchUpdate = new BatchUpdate(singles, slides, noteModifications, noteOriginalDatas, operation)
    this.updateSlides = new UpdateSlides(slides, slideModifications, slideOriginalDatas)
  }

  exec() {
    this.batchUpdate.exec()
    this.updateSlides.exec()
    return { singles: this.singles, slides: this.slides }
  }

  undo() {
    this.updateSlides.undo()
    this.batchUpdate.undo()
    return { singles: this.singles, slides: this.slides }
  }
}

// #endregion

// #region TimeSignature Mutations

export abstract class TimeSignatureMutation extends Mutation<Map<number, [number, number]>> {
  timeSignatures: Map<number, [number, number]>
  measure: number
  constructor(timeSignatures: Map<number, [number, number]>, measure: number) {
    super()
    this.amount = 1
    this.target = 'timeSignature'
    this.timeSignatures = timeSignatures
    this.measure = measure
  }
}

export class SetTimeSignature extends TimeSignatureMutation {
  value: [number, number]
  constructor(timeSignatures: Map<number, [number, number]>, measure: number, value: [number, number], operation: Operation) {
    super(timeSignatures, measure)
    this.value = value
    this.operation = operation
  }

  exec() {
    this.timeSignatures.set(this.measure, this.value)
    return this.timeSignatures
  }

  undo() {
    this.timeSignatures.delete(this.measure)
    return this.timeSignatures
  }
}

export class RemoveTimeSignature extends TimeSignatureMutation {
  oldValue: [number, number]
  constructor(timeSignatures: Map<number, [number, number]>, measure: number, operation: Operation) {
    super(timeSignatures, measure)
    this.operation = operation
    const oldValue = timeSignatures.get(measure)
    if (!oldValue) throw new Error(`Unexpected non-exist timeSignature at measure #${measure}`)
    this.oldValue = oldValue
  }

  exec() {
    this.timeSignatures.delete(this.measure)
    return this.timeSignatures
  }

  undo() {
    this.timeSignatures.set(this.measure, this.oldValue)
    return this.timeSignatures
  }
}

// #endregion