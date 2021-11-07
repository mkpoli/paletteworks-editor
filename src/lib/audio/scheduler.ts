import type { EFFECT_SOUNDS } from '$lib/consts'
export type Sound = keyof typeof EFFECT_SOUNDS
export type AudioEvent = {
  time: number,
  sound: Sound | 'bgm',
  loopTo?: number,
  startFrom?: number
}

type EventCallback = (event: AudioEvent, offset: number) => void

export type SchedulerOption = {
  scheduleInterval?: number
  scheduleLookahead?: number
  events?: Array<AudioEvent>
  callback?: EventCallback
}

export class AudioScheduler {
  audioContext: AudioContext
  audioNodes: AudioBufferSourceNode[]
  scheduleInterval: number   // schedule new events at this interval
  scheduleLookahead: number // schedule new events this far into the future
  events: AudioEvent[]                       // an events object that must at least contain the time property for each event
  callback: EventCallback             // a function used to play the events
  eventsIndexNeedle: number // a needle used to go through the events index by index
  timerID: number                               // used by clearTimeout() to identify the setTimeout timer
  startTimeOffset: number

  constructor(audioContext: AudioContext, audioNodes: AudioBufferSourceNode[], {
    scheduleInterval =  50,  // in milliseconds
    scheduleLookahead = 100, // in milliseconds
    events = [],
    callback = () => {}
  }: SchedulerOption) {
    this.audioContext = audioContext
    this.audioNodes = audioNodes               // keep track of all created audio nodes so they can be stopped
    this.scheduleInterval = scheduleInterval   // schedule new events at this interval
    this.scheduleLookahead = scheduleLookahead // schedule new events this far into the future
    this.events = events                       // an events object that must at least contain the time property for each event
    this.callback = callback                   // a function used to play the events
    this.eventsIndexNeedle                     // a needle used to go through the events index by index
    this.timerID                               // used by clearTimeout() to identify the setTimeout timer
    this.startTimeOffset                       // the offset between the time at audioContext creation and audioContext.currentTime
  }

  private _stopAllAudioNodes() {
    for (const node of this.audioNodes) {
      node.stop(0)
    }
  }

  stop() {
    if (this.audioContext.state === 'running') {
      this.audioContext.suspend()
    }
    this._stopAllAudioNodes()
    clearTimeout(this.timerID)
  }

  reset() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    this.eventsIndexNeedle = 0
    this.timerID = null
    this.startTimeOffset = this.audioContext.currentTime
  }

  start() {
    this.stop()
    this.reset()
    this.play()
  }

  play() {
    while(
      this.eventsIndexNeedle < this.events.length &&
      typeof this.events[this.eventsIndexNeedle].time === "number" &&
      (this.events[this.eventsIndexNeedle].time + this.startTimeOffset <
      this.audioContext.currentTime + (this.scheduleLookahead / 1000))
    ) {
      this.callback(this.events[this.eventsIndexNeedle], this.startTimeOffset)
      this.eventsIndexNeedle++
    }
    this.timerID = window.setTimeout(() => { this.play() }, this.scheduleInterval)
  }

  // pause() {
  //   if (this.audioContext.state === 'running') {
  //     this.audioContext.suspend()
  //   } else if(this.audioContext.state === 'suspended') {
  //     this.audioContext.resume()
  //   }
  // }
}

export function playOnce(audioContext: AudioContext, target: GainNode | AudioDestinationNode, buffer: AudioBuffer) {
  const soundSource = audioContext.createBufferSource()
  soundSource.buffer = buffer
  soundSource.connect(target)
  soundSource.start()
}