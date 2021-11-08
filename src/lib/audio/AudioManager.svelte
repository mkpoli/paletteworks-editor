<script lang="ts">
  import { onMount } from "svelte"
  import { AudioEvent, AudioScheduler, playOnce } from '$lib/audio/scheduler'
  import { EFFECT_SOUNDS, TICK_PER_BEAT } from "$lib/consts"

  import type { Single, Slide } from "$lib/score/beatmap"

  export let paused: boolean
  export let currentTick: number
  export let currentBPM: number
  export let soundQueue: string[]
  export let singles: Single[]
  export let slides: Slide[]
  export let bgmURL: string
  export let volume: number
  export let sfxVolume: number
  export let gotoTick: (tick: number) => void
  export let lastTick: number

  let scheduler: AudioScheduler
  let audioContext: AudioContext
  let effectBuffers: Record<string, AudioBuffer>
  
  const audioNodes: Array<AudioBufferSourceNode> = []

  $: if (!paused) {
    // Pause -> Start (Resuming)
    lastTick = getCurrentTick()
    startScheduler()
  } else {
    // Start -> Pause (Pausing)
    stopScheduler()
  }

  function getCurrentTick() {
    return currentTick
  }

  let master: GainNode
  $: if (master) { master.gain.value = volume }

  let sfxGain: GainNode
  $: if (sfxGain) { sfxGain.gain.value = sfxVolume }

  $: if (bgmURL) { 
    paused = true
    stopScheduler()
    currentTick = 0
   } 

  $: if (currentBPM) restartScheduler()

  function stopScheduler() {
    scheduler?.stop()
    scheduler = null
  }

  function startScheduler() {
    scheduler = newSchedular()
    scheduler.start()
  }

  function restartScheduler(from?: number) {
    if (!audioContext) return
    if (scheduler) {
      stopScheduler()
    }
    if (from !== undefined) {
      currentTick = from
    }
    if (!paused) {
      startScheduler()
    }
  }

  gotoTick = (tick) => { restartScheduler(tick) }

  $: if (soundQueue) {
    soundQueue.forEach((sound) => {
      playOnce(audioContext, master, effectBuffers[sound])
    })
    soundQueue = []
  }

  let bgmBuffer: AudioBuffer

  async function createAudioBuffer(url: string) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return await audioContext.decodeAudioData(arrayBuffer)
  }

  $: createAudioBuffer(bgmURL).then((buffer) => {
    bgmBuffer = buffer
  })

  function tick2secs(tick: number) {
    return tick / (TICK_PER_BEAT * currentBPM / 60)
  }

  onMount(async () => {
    // Initialise Audio
    audioContext = new AudioContext()
    master = audioContext.createGain();
    master.connect(audioContext.destination)
    sfxGain = audioContext.createGain();
    sfxGain.connect(master)
    effectBuffers = Object.fromEntries(await Promise.all(Object.entries(EFFECT_SOUNDS).map(async ([name, path]) => {
      const response = await fetch(path)
      const arrayBuffer = await response.arrayBuffer()
      return [name, await audioContext.decodeAudioData(arrayBuffer)]
    })))
  })


  function newSchedular(): AudioScheduler {
    const bgmEvent: AudioEvent = {
      time: 0,
      sound: 'bgm',
      startFrom: tick2secs(currentTick)
    }

    let events: Array<AudioEvent> = [bgmEvent]

    if (sfxVolume !== 0) {
      const singleEvents: AudioEvent[] = singles
        .filter(({ tick }) => tick >= currentTick)
        .map(({ tick, critical, flick }) => ({
          time: tick2secs(tick - currentTick),
          sound: flick !== 'no'
                  ? (critical ? 'flickCritical' : 'flick')
                  : (critical ? 'tapCritical' : 'tapPerfect' ) 
        }))
  
      const slideEvents = slides
        .filter(({ tail: { tick } }) => tick >= currentTick)
        .reduce((acc, { critical, head, tail, steps }) => {
          const startEvent: AudioEvent = head.tick >= currentTick
            ? {
                time: tick2secs(head.tick - currentTick),
                sound: !critical ? 'tick' : 'tickCritical'
              }
            : null
  
          const connectEvent: AudioEvent = 
            {
              time: tick2secs(Math.max(head.tick, currentTick) - currentTick),
              sound: !critical ? 'connect' : 'connectCritical',
              loopTo: tick2secs(tail.tick - currentTick)
            }
    
          const endEvent: AudioEvent = 
            {
              time: tick2secs(tail.tick - currentTick),
              sound: tail.flick !== 'no'
                  ? (critical ? 'flickCritical' : 'flick')
                  : (critical ? 'tapCritical' : 'tapPerfect' ) 
            }
  
          const stepEvents = steps
            .filter(({ tick }) => tick >= currentTick)
            .reduce((a, { tick, diamond }) => {
              if (diamond) {
                a.push({
                  time: tick2secs(tick - currentTick),
                  sound: !critical ? 'tick' : 'tickCritical'
                })
              }
              return a
            }, [] as AudioEvent[])
  
          return [...acc, connectEvent, startEvent, endEvent, ...stepEvents]
        }, [] as AudioEvent[])
  
        events = [...events, ...singleEvents, ...slideEvents]
          .filter((event) => event)
          .sort(({ time: a }, { time: b }) => a - b)
    }

    return new AudioScheduler(audioContext, audioNodes, {
      events,
      callback(event: AudioEvent, offset: number) {
        const soundSource = audioContext.createBufferSource()
        soundSource.buffer = event.sound === 'bgm' ? bgmBuffer : effectBuffers[event.sound]
        if (event.loopTo) {
          soundSource.loop = true
        }
        audioNodes.push(soundSource)
        soundSource.connect(event.sound === 'bgm' ? master : sfxGain)
        const startTime = event.time + offset
        soundSource.start(startTime, event.startFrom ? tick2secs(currentTick) : null)
        if (event.loopTo) {
          soundSource.loop = true
          soundSource.stop(event.loopTo)
        }
      }
    })
  }
</script>