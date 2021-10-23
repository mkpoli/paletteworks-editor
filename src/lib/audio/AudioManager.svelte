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

  let scheduler: AudioScheduler
  let audioContext: AudioContext
  let effectBuffers: Record<string, AudioBuffer>
  let master: GainNode
  
  const audioNodes: Array<AudioBufferSourceNode> = []

  $: if (!paused) {
    // Pause -> Start
    scheduler = newSchedular()
    scheduler.start()
  } else {
    // Start -> Pause
    scheduler?.stop()
  }

  $: if (soundQueue) {
    soundQueue.forEach((sound) => {
      playOnce(audioContext, master, effectBuffers[sound])
    })
    soundQueue = []
  }

  function tick2secs(tick: number) {
    return tick / (TICK_PER_BEAT * currentBPM / 60)
  }

  onMount(async () => {
    // Initialise Audio
    audioContext = new AudioContext()
    master = audioContext.createGain();
    master.gain.value = 0.15
    master.connect(audioContext.destination)
  
    effectBuffers = Object.fromEntries(await Promise.all(Object.entries(EFFECT_SOUNDS).map(async ([name, path]) => {
      const response = await fetch(path)
      const arrayBuffer = await response.arrayBuffer()
      return [name, await audioContext.decodeAudioData(arrayBuffer)]
    })))
    console.log({effectBuffers})
  })


  function newSchedular(): AudioScheduler {
    const bgmEvent: AudioEvent = {
      time: 0,
      sound: 'bgm',
      startFrom: tick2secs(currentTick)
    }

    const singleEvents: AudioEvent[] = singles
      .filter(({ tick }) => tick >= currentTick)
      .map(({ tick, critical, flick }) => ({
        time: tick2secs(tick - currentTick),
        sound: flick !== 'no'
                ? (critical ? 'flickCritical' : 'flick')
                : (critical ? 'tapCritical' : 'tapPerfect' ) 
      }))

    const slideEvents = slides
      .filter(({ end: { tick } }) => tick >= currentTick)
      .reduce((acc, { critical, start, end, steps }) => {
        const startEvent: AudioEvent = start.tick >= currentTick
          ? {
              time: tick2secs(start.tick - currentTick),
              sound: !critical ? 'tick' : 'tickCritical'
            }
          : null

        const connectEvent: AudioEvent = 
          {
            time: tick2secs(Math.max(start.tick, currentTick) - currentTick),
            sound: !critical ? 'connect' : 'connectCritical',
            loopTo: tick2secs(end.tick - currentTick)
          }
  
        const endEvent: AudioEvent = 
          {
            time: tick2secs(end.tick - currentTick),
            sound: end.flick !== 'no'
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

    const events: Array<AudioEvent> = [bgmEvent, ...singleEvents, ...slideEvents]
      .filter((event) => event)
      .sort(({ time: a }, { time: b }) => a - b)

    console.log(events)

    return new AudioScheduler(audioContext, audioNodes, {
      events,
      callback(event: AudioEvent, offset: number) {
        const soundSource = audioContext.createBufferSource()
        soundSource.buffer = effectBuffers[event.sound]
        if (event.loopTo) {
          soundSource.loop = true
        }
        audioNodes.push(soundSource)
        soundSource.connect(master)
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