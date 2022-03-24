<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { AudioEvent, AudioScheduler, playOnce } from '$lib/audio/scheduler'
  import { EFFECT_SOUNDS, TICK_PER_BEAT } from '$lib/consts'
  import { accumulateDuration, sortedBPMs, tick2secs } from '$lib/timing'

  import type { Single, Slide } from '$lib/score/beatmap'

  export let paused: boolean
  export let currentTick: number
  export let bpms: Map<number, number>
  export let soundQueue: string[]
  export let singles: Single[]
  export let slides: Slide[]
  export let music: File | null
  export let volume: number
  export let sfxVolume: number
  export let sfxEnabled: boolean
  export let gotoTick: (tick: number) => void
  export let detectBPM: () => void
  export let lastTick: number
  export let bgmLoading: boolean
  export let musicDuration: number | undefined = undefined
  export let offset: number
  export let musicLoadedFromFile: boolean

  const dispatch = createEventDispatcher<{
    bpmdetected: number
  }>()

  let scheduler: AudioScheduler | null = null
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
  $: if (master) {
    master.gain.value = volume
  }

  let sfxGain: GainNode
  $: if (sfxGain) {
    sfxGain.gain.value = sfxEnabled ? sfxVolume : 0
  }

  let bgmBuffer: AudioBuffer | null = null

  async function createAudioBuffer(blob: Blob) {
    const response = await fetch(URL.createObjectURL(blob))
    const arrayBuffer = await response.arrayBuffer()
    return await audioContext.decodeAudioData(arrayBuffer)
  }

  function getBPM(tick: number) {
    return bpms.get([...bpms.keys()].closest(tick) ?? NaN) ?? 120
  }

  import detect from 'bpm-detective'
  detectBPM = () => {
    console.log('detecting BPM')
    if (bgmBuffer) {
      try {
        const bpm = detect(bgmBuffer)
        dispatch('bpmdetected', bpm)
      } catch (e) {
        console.error(e)
      }
    }
  }

  $: onchangemusic(music)
  function onchangemusic(music: File | null) {
    stopScheduler()
    paused = true
    currentTick = 0

    if (music) {
      bgmLoading = true
      createAudioBuffer(music).then((buffer) => {
        bgmBuffer = buffer
        bgmLoading = false
        musicDuration = buffer.duration + offset

        if (musicLoadedFromFile) {
          detectBPM()
        }

        if (!paused) {
          restartScheduler()
        }
      })
    } else {
      bgmBuffer = null
      musicDuration = undefined
    }
  }

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

  gotoTick = (tick) => {
    restartScheduler(Math.max(0, tick))
  }

  $: if (soundQueue) {
    soundQueue.forEach((sound) => {
      playOnce(audioContext, master, effectBuffers[sound])
    })
    soundQueue = []
  }

  onMount(async () => {
    // Initialise Audio
    audioContext = new AudioContext()
    master = audioContext.createGain()
    master.connect(audioContext.destination)
    sfxGain = audioContext.createGain()
    sfxGain.connect(master)
    effectBuffers = Object.fromEntries(
      await Promise.all(
        Object.entries(EFFECT_SOUNDS).map(async ([name, path]) => {
          const response = await fetch(path)
          const arrayBuffer = await response.arrayBuffer()
          return [name, await audioContext.decodeAudioData(arrayBuffer)]
        })
      )
    )
  })

  function generateEvents(
    from: number,
    to: number,
    bpm: number,
    fromTime: number
  ): AudioEvent[] {
    const tick2time = (tick: number) =>
      fromTime + tick2secs(tick - from, TICK_PER_BEAT, bpm)

    return Array.from(
      new Set([
        ...singles
          .filter((single) => single.tick >= from && single.tick <= to)
          .map(({ tick, critical, flick }) => {
            const time = tick2time(tick)
            const sound =
              flick !== 'no'
                ? critical
                  ? 'flickCritical'
                  : 'flick'
                : critical
                  ? 'tapCritical'
                  : 'tapPerfect-single'
            return `${time}-${sound}`
          }),
        ...slides
          .filter(({ head, tail }) => tail.tick >= from && head.tick <= to)
          .flatMap(({ head, tail, steps, critical }) => [
            head.tick >= from
              ? `${tick2time(head.tick)}-tapPerfect-slide`
              : undefined,
            ...steps
              .filter(
                ({ tick, diamond }) => tick >= from && tick <= to && diamond
              )
              .map(
                ({ tick }) =>
                  `${tick2time(tick)}-${
                    critical ? 'tickCritical' : 'tick'
                  }`
              ),
            tail.tick <= to
              ? `${tick2time(tail.tick)}-${
                  tail.flick !== 'no'
                    ? critical || tail.critical
                      ? 'flickCritical'
                      : 'flick'
                    : 'tapPerfect-slide'
                }`
              : undefined,
          ])
          .filter((event): event is string => event !== undefined),
      ])
    ).map((event) => {
      const [time, sound] = event.split('-')
      return { time: parseFloat(time), sound } as AudioEvent
    })
  }

  function newSchedular(): AudioScheduler {
    const accumulatedDuration = accumulateDuration(
      currentTick,
      $sortedBPMs,
      TICK_PER_BEAT
    )

    const bgmEvent: AudioEvent = {
      time: accumulatedDuration < offset ? offset : 0,
      sound: 'bgm',
      startFrom:
        accumulatedDuration < offset ? 0 : accumulatedDuration - offset,
    }

    let events: Array<AudioEvent> = [bgmEvent]

    let accumulatedTime = 0
    const bpmAreas = [
      [currentTick, getBPM(currentTick)],
      ...$sortedBPMs.filter(([tick]) => tick > currentTick),
    ].map(([currTick, bpm], ind, arr) => {
      const nextTick = ind < arr.length - 1 ? arr[ind + 1][0] : Infinity
      const result = {
        fromTick: currTick,
        toTick: nextTick,
        bpm,
        fromTime: accumulatedTime,
      }
      accumulatedTime += tick2secs(nextTick - currTick, TICK_PER_BEAT, bpm)
      return result
    })

    const noteEvents = bpmAreas.flatMap(({ fromTick, toTick, bpm, fromTime }) =>
      generateEvents(fromTick, toTick, bpm, fromTime)
    )

    function accumulate(tick: number) {
      const nearestBPMTick =
        $sortedBPMs.map(([tick]) => tick).closest(tick) ?? 0
      const nearestBPMStartFrom =
        bpmAreas.find(({ fromTick }) => fromTick === nearestBPMTick)
          ?.fromTime ?? 0
      const lastDuration = tick2secs(
        tick - Math.max(nearestBPMTick, currentTick),
        TICK_PER_BEAT,
        bpms.get(nearestBPMTick) ?? 0
      )
      return nearestBPMStartFrom + lastDuration
    }

    const connectEvents = slides
      .filter(({ tail }) => tail.tick > currentTick)
      .map(
        ({ head, tail, critical }) =>
          ({
            time: accumulate(Math.max(head.tick, currentTick)),
            sound: !critical ? 'connect' : 'connectCritical',
            loopTo: accumulate(tail.tick),
          } as AudioEvent)
      )

    events = [...events, ...noteEvents, ...connectEvents].sort(
      ({ time: a }, { time: b }) => a - b
    )

    return new AudioScheduler(audioContext, audioNodes, {
      events,
      callback(event: AudioEvent, offset: number) {
        if (event.sound === 'bgm' && !bgmBuffer) return
        const soundSource = audioContext.createBufferSource()
        soundSource.buffer =
          event.sound === 'bgm' ? bgmBuffer : effectBuffers[event.sound]
        if (event.loopTo) {
          soundSource.loop = true
        }
        audioNodes.push(soundSource)
        soundSource.connect(event.sound === 'bgm' ? master : sfxGain)
        soundSource.start(event.time + offset, event.startFrom)
        if (event.loopTo) {
          soundSource.stop(event.loopTo + offset)
        }
      },
    })
  }
</script>
