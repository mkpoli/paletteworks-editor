<script lang="ts" context="module">
  export const ssr = false;
	export async function load({ page, fetch, session, context }) {
		// const url = `/RelayPoint.sus`;
		// const url = `/NewScore2.sus`;
    // const url = `KING.sus`;
    const url = `/TellYourWorld_EX.sus`;
    // const url = `MultipleBPM.sus`;
    // const url = `SlideTest.sus`;
    // const url = `ModNote.sus`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					susText: await res.text()
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script lang="ts">
  // Parts
  import ToolBox from '$lib/ToolBox.svelte'
  import PropertyBox from '$lib/PropertyBox.svelte'
  
  // Components
  import ZoomIndicator from '$lib/ZoomIndicator.svelte'
  import ControlHandler from '$lib/ControlHandler.svelte'
  import DebugInfo from '$lib/basic/DebugInfo.svelte'
  import BpmDialog from '$lib/dialogs/BPMDialog.svelte';

  // Types
  import type PIXI from 'pixi.js'
  import type { Mode, SnapTo } from '$lib/editing'
  import type { Flick, MetaData, Single, Slide } from '$lib/beatmap'
  import type { Score } from '$lib/sus/analyze'

  // Imports
  import { getMetaData, getScoreData, convertScoreData } from '$lib/sus/susIO'
  import { onMount, tick } from 'svelte';
  import {
    MARGIN,
    MARGIN_BOTTOM,
    TEXT_MARGIN,
    MEASURE_HEIGHT,
    CANVAS_WIDTH,
    LANE_WIDTH,
    NOTE_HEIGHT,
    NOTE_PIVOT,
    NOTE_WIDTH,
    DIAMOND_HEIGHT,
    DIAMOND_WIDTH,
    DIAMOND_PIVOT,
    TICK_PER_MEASURE,
    TICK_PER_BEAT,
    EFFECT_SOUNDS,
  } from '$lib/consts'
  import { FLICK_TYPES } from '$lib/beatmap';

  // Calculations
  import { calcX, calcY, calcLane, calcTick } from '$lib/timing'
  import { snap } from '$lib/editing'

  // Data
  export let susText: string;
  let metadata: MetaData
  let score: Score

  // Load Score Data
  metadata = getMetaData(susText)
  score = getScoreData(susText)
  let singleNotes: Single[]
  let slides: Slide[]
  let bpms: Map<number, number>
  ({ singleNotes, slides, bpms } = convertScoreData(score))

  console.log(score)
  console.log({ singleNotes, slides, bpms })

  // Sound
  import { AudioEvent, AudioScheduler } from '$lib/audio';
  let audioContext: AudioContext
  let effectBuffers: Record<string, AudioBuffer>
  const audioNodes: Array<AudioBufferSourceNode> = []
  let scheduler: AudioScheduler
  let master: GainNode

  // PIXI.js
  let PIXI: typeof import('pixi.js')
  let app: PIXI.Application

  // Playhead & Measures
  $: measureHeight = MEASURE_HEIGHT * zoom

  let playhead: number = 0
  $: if (playhead < 0) playhead = 0
  $: if (playhead >= fullHeight) playhead = fullHeight

  $: currentMeasure = Math.floor(playhead / measureHeight  + 1)

  // Zooming
  let zoom = 1
  const ZOOM_MIN = 0.1
  const ZOOM_MAX = 10.0
  $: if (zoom <= ZOOM_MIN) zoom = ZOOM_MIN
  $: if (zoom >= ZOOM_MAX) zoom = ZOOM_MAX
  // $: zoom && playhead
  
  // Follow playhead
  $: if (app) {
    app.stage.pivot.y = MARGIN_BOTTOM - playhead
  }

  // Canvas Size
  $: fullHeight = score ? (score.maxMeasure + 1) * measureHeight : 0
  let innerHeight: number
  // Resize when width / viewHeight changed
  $: if (app) {
    app.renderer.resize(CANVAS_WIDTH, innerHeight)
  }

  function tick2secs(tick: number) {
    return tick / (TICK_PER_BEAT * currentBPM / 60)
  }

  // Textures
  import spritesheet from '$assets/spritesheet.json'
  import spritesheetImage from '$assets/spritesheet.png'

  let TEXTURES: Record<string, PIXI.Texture> = {}

  // PointerX, Y
  let mouseX: number
  let mouseY: number

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
    
    // Initialise PIXI.js
    PIXI = await import('pixi.js')
    app = new PIXI.Application({
      width: CANVAS_WIDTH,
      height: innerHeight,
      antialias: true,
      resolution: 2,
      backgroundAlpha: 0
    })

    app.stage.interactive = true
    app.stage.on('mousemove', (event: PIXI.InteractionEvent) => {
      const { x, y } = event.data.global
      mouseX = x
      mouseY = y
    })

    app.renderer.view.addEventListener('click', async () => {
      if (currentMode === 'bpm') {
        lastPointerTick = pointerTick
        if (bpms.has(pointerTick)) {
          bpmDialogValue = bpms.get(pointerTick)
        }
        await tick()
        bpmDialogOpened = true
        return
      }

      if (currentMode === 'tap') {
        singleNotes.push({
          lane: pointerLane,
          tick: pointerTick,
          width: 2,
          critical: false,
          flick: 'no'
        })
        singleNotes = singleNotes
        return
      }

      const singleHere = singleNotes.find((single) => (
            single.tick === pointerTick &&
            single.lane <= pointerLane && pointerLane <= single.lane + single.width
        )
      )

      if (currentMode === 'flick') {
        if (singleHere) {
          singleHere.flick = rotateNext<Flick>(singleHere.flick, FLICK_TYPES)
          singleNotes = singleNotes
          return
        }

        const slideEndHere = slides.find((slide) => (
          slide.end.tick === pointerTick &&
          slide.end.lane <= pointerLane && pointerLane <= slide.end.lane + slide.end.width
        ))
        if (slideEndHere) {
          slideEndHere.end.flick = rotateNext<Flick>(slideEndHere.end.flick, FLICK_TYPES)
        }
        slides = slides
        return
      }

      if (currentMode === 'critical') {
        if (singleHere) {
          singleHere.critical = !singleHere.critical
          singleNotes = singleNotes
          return
        }

        const slideStartHere = slides.find((slide) => {
          return (
            slide.start.tick === pointerTick &&
            slide.start.lane <= pointerLane && pointerLane <= slide.start.lane + slide.start.width
          )
        })
        if (slideStartHere) {
          slideStartHere.critical = !slideStartHere.critical
        }
      }
    })


    // app.renderer.view.addEventListener('dblclick', () => {
    //   if (currentMode === 'bpm') {
    //     bpms.delete(pointerTick)
    //     bpms = bpms
    //     return
    //   }

    //   if (currentMode === 'select') {
    //     const singleHere = singleNotes.find((single) => (
    //           single.tick === pointerTick &&
    //           single.lane <= pointerLane && pointerLane <= single.lane + single.width
    //       )
    //     )
    //     if (singleHere) {
    //       singleNotes.splice(singleNotes.indexOf(singleHere), 1)
    //       singleNotes = singleNotes
    //       return
    //     }
    //   }
    // })
  
    // app.stage.addChild(new PIXI.Sprite.from(createGradientCanvas(CANVAS_WIDTH, innerHeight, ['#503c9f', '#48375b'])))
    const baseTexture = new PIXI.BaseTexture(spritesheetImage, null, 1);
    const spritesheetObj = new PIXI.Spritesheet(baseTexture, spritesheet)

    spritesheetObj.parse((textures) => {
      TEXTURES = textures
    });

    app.ticker.add(() => {
      if (!paused) {
        currentTick += app.ticker.deltaMS * TICK_PER_BEAT * currentBPM / 1000 / 60
      }
    })
  })

  import { Pixi, Text, Sprite, Graphics } from 'svelte-pixi'
  import { drawBackground, drawSlidePath, drawBPMs, drawSnappingElements, drawPlayhead } from '$lib/renderer';
  import { clamp } from '$lib/basic/math'
  import { closest, rotateNext } from '$lib/basic/collections';

  let canvasContainer: HTMLDivElement
  // audioFileURL = files && files[0] ? URL.createObjectURL(files[0]) : undefined 
  let files: FileList
  let paused: boolean = true
  let currentTick: number = 0
  $: dbg('currentTick', currentTick)

  let currentMode: Mode = 'select'
  let snapTo: SnapTo = 8

  type DebugInfo = {
    title: string
    value: string
  }
  let debugInfo = new Map<string, string | number>()
  function formatPoint(x: number, y: number) {
    return `(${x?.toFixed(3)}, ${y?.toFixed(3)})`
  }
  
  function dbg(title: string, value: string | number) {
    debugInfo.set(title, value)
    debugInfo = debugInfo
  }

  $: MAX_MEASURE = score.maxMeasure + 2

  $: pointerLane = clamp(2, snap(calcLane(mouseX), 1, 0), 12)
  $: pointerTick = clamp(0, snap(calcTick(mouseY, measureHeight), TICK_PER_MEASURE / snapTo, 0), MAX_MEASURE * TICK_PER_MEASURE)

  $: dbg('mouse', formatPoint(mouseX, mouseY))
  $: dbg('stage.pivot', formatPoint(app?.stage.pivot.x, app?.stage.pivot.y))
  $: dbg('playhead', playhead)
  $: dbg('pointerLane', pointerLane)
  $: dbg('pointerTick', pointerTick)
  
  $: currentBPM = bpms.get(closest([...bpms.keys()], currentTick, true))
  $: dbg('closestTick', currentBPM)
  $: dbg('currentBPM', currentBPM)

  $: dbg('bpms', [...bpms.entries()].map((e) => `[${e[0]}]=${e[1]}bpm`).join('\n'))

  let bpmDialogOpened: boolean = false
  let bpmDialogValue: number = 120
  let lastPointerTick: number = 0

  function newSchedular(): AudioScheduler {
    const bgmEvent: AudioEvent = {
      time: 0,
      sound: 'bgm',
      startFrom: tick2secs(currentTick)
    }

    const singleEvents: AudioEvent[] = singleNotes
      .filter(({ tick }) => tick >= currentTick)
      .map(({ tick, critical, flick }) => ({
        time: tick2secs(tick - currentTick),
        sound: flick !== 'no'
                ? (critical ? 'flickCritical' : 'flick')
                : (critical ? 'tapCritical' : 'tapPerfect' ) 
      }))

    const slideEvents = slides
      .reduce((acc, { critical, start, end, steps }) => {
        const connectEvent: AudioEvent = 
          end.tick <= currentTick
            ? {
                time: tick2secs(Math.max(start.tick, currentTick) - currentTick),
                sound: !critical ? 'connect' : 'connectCritical',
                loopTo: tick2secs(end.tick - currentTick)
              }
            : null
        const startEvent: AudioEvent = start.tick >= currentTick
          ? {
              time: tick2secs(start.tick - currentTick),
              sound: !critical ? 'tick' : 'tickCritical'
            }
          : null
        const endEvent: AudioEvent = end.tick >= currentTick
          ? {
            time: tick2secs(end.tick - currentTick),
            sound: end.flick !== 'no'
                ? (critical ? 'flickCritical' : 'flick')
                : (critical ? 'tapCritical' : 'tapPerfect' ) 
          }
          : null
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
        console.log({filtered: steps.filter(({ tick }) => tick >= currentTick)})
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

  $: if (!paused) {
    // Pause -> Start
    scheduler = newSchedular()
    scheduler.start()
  } else {
    // Start -> Pause
    scheduler?.stop()
  }
</script>

<svelte:head>
  <title>PaletteWorks Editor</title>
</svelte:head>

<main class="cursor-select">
  {#if app}
    <ToolBox
      bind:currentMode
      bind:snapTo
    />
    <div
      class="canvas-container"
      bind:this={canvasContainer}
      style={`width: ${CANVAS_WIDTH}px;`}
    >
      <Pixi {app}>
          <!-- PLAYHEAD -->
          <Graphics
            draw={(graphics) => {
              drawPlayhead(graphics, PIXI, calcY(currentTick, measureHeight))
            }}
          />

          <!-- BACKGROUND -->
          <Graphics
            x={MARGIN}
            y={0}
            draw={(graphics) => { drawBackground(graphics, measureHeight, fullHeight, score.maxMeasure) }}
          />

          <!-- BPM -->
          <Graphics
            draw={(graphics) => { drawBPMs(graphics, PIXI, bpms, measureHeight) }}
          />

          <!-- MEASURE (BAR) NUMBER -->
          {#each Array(score.maxMeasure + 2) as _, i}
            <Text
              text={`#${i + 1}`}
              anchor={new PIXI.Point(1, 0.5)}
              x={MARGIN - TEXT_MARGIN}
              y={innerHeight - (MARGIN_BOTTOM + (i * measureHeight))}
              style={{
                fill: 'white'
              }}
            />
          {/each}

          <!-- SINGLE NOTES -->
          {#each singleNotes as { lane, tick, width, critical, flick }}
            {#if flick !== 'no'}
              <!-- FLICK ARROW -->
              <Sprite
                texture={
                  TEXTURES[
                    `notes_flick_arrow${ critical ? '_crtcl' : ''}_0${ Math.floor(width / 2) }${(flick === 'left' || flick === 'right') ? '_diagonal': ''}.png`
                  ]
                }
                anchor={new PIXI.Point(0, 0.5)}
                x={calcX(lane) + {
                  'left': -NOTE_WIDTH,
                  'right': 3 * NOTE_WIDTH,
                  'middle': 0
                }[flick]}
                y={calcY(tick, measureHeight) - NOTE_HEIGHT + 10}
                width={width * NOTE_WIDTH * (flick === 'right' ? -1: 1) * 0.75}
                height={NOTE_HEIGHT}
              />
            {/if}

            <Sprite
              texture={
                critical
                  ? TEXTURES['noteC.png']
                  : flick !== 'no'
                    ? TEXTURES['noteF.png']
                    : TEXTURES['noteN.png']
              }
              anchor={new PIXI.Point(...NOTE_PIVOT)}
              x={calcX(lane)}
              y={calcY(tick, measureHeight)}
              width={width * NOTE_WIDTH}
              height={NOTE_HEIGHT}
            />
          {/each}

          <!-- SLIDE NOTES -->
          {#each slides as { start, steps, end, critical }}
            <!-- SLIDE PATH -->
            <Graphics
              x={0}
              y={0}
              draw={(graphics) => {drawSlidePath(graphics, [start, ...steps, end], critical, measureHeight)}}
            />
            <!-- SLIDE START -->
            <Sprite
              texture={critical ? TEXTURES['noteC.png'] : TEXTURES['noteL.png']}
              anchor={new PIXI.Point(...NOTE_PIVOT)}
              x={calcX(start.lane)}
              y={calcY(start.tick, measureHeight)}
              width={start.width * NOTE_WIDTH}
              height={NOTE_HEIGHT}
            />

            <!-- SLIDE STEPS -->
            {#each steps as { lane, tick, width }}
              <Sprite
                texture={TEXTURES[`notes_long_among${critical ? '_crtcl' : ''}.png`]}
                anchor={new PIXI.Point(...DIAMOND_PIVOT)}
                x={calcX(lane) + (width * NOTE_WIDTH) / 2 - DIAMOND_WIDTH}
                y={calcY(tick, measureHeight)}
                width={DIAMOND_WIDTH}
                height={DIAMOND_HEIGHT}
                />
            {/each}

            <!-- SLIDE END -->
            {#if end.flick !== 'no'}
              <Sprite
                texture={
                  TEXTURES[
                    `notes_flick_arrow${ critical ? '_crtcl' : ''}_0${ Math.floor(end.width / 2) }${(end.flick === 'left' || end.flick === 'right') ? '_diagonal': ''}.png`
                  ]
                }
                anchor={new PIXI.Point(0, 0.5)}
                x={calcX(end.lane) + {
                  'left': -NOTE_WIDTH,
                  'right': 3 * NOTE_WIDTH,
                  'middle': 0
                }[end.flick]}
                y={calcY(end.tick, measureHeight) - NOTE_HEIGHT + 10}
                width={end.width * NOTE_WIDTH * (end.flick === 'right' ? -1: 1) * 0.75}
                height={NOTE_HEIGHT}
              />
            {/if}
            <Sprite
              texture={
                critical
                  ? TEXTURES['noteC.png']
                  : end.flick !== 'no'
                    ? TEXTURES['noteF.png']
                    : TEXTURES['noteL.png']
              }
              anchor={new PIXI.Point(...NOTE_PIVOT)}
              x={calcX(end.lane)}
              y={calcY(end.tick, measureHeight)}
              width={end.width * NOTE_WIDTH}
              height={NOTE_HEIGHT}
            />
          {/each}
  
          <!-- FLOATING ITEMS -->
          <Graphics
            draw={(graphics) => {
              drawSnappingElements(
                graphics, PIXI, TEXTURES, currentMode,
                calcX(pointerLane) + LANE_WIDTH, calcY(pointerTick, measureHeight) - playhead,
                bpms.has(pointerTick)
              )
            }}
          />
        <!-- </Loader> -->
      </Pixi>
      <div class="zoom-indicator-container">
        <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={0.1} />
      </div>
    </div>
    <PropertyBox
      bind:playhead
      bind:currentMeasure
      on:goto={() => {
        if (currentMeasure >= 1 && currentMeasure <= score.maxMeasure + 2) {
          playhead = (currentMeasure - 1) * measureHeight
        } else {
          // TODO: Popup
        }
      }}
      statistics={{
        'Taps': singleNotes.filter((x) => x.flick === 'no').length,
        'Flicks': singleNotes.filter((x) => x.flick !== 'no').length,
        'Slides': slides.length,
        'Total': singleNotes.length + slides.length,
      }}
      bind:player
      bind:paused
      bind:currentTime
      bind:metadata
      bind:files
    />
    <!-- <li>Combos: {singleNotes.length + slides.reduce((acc, ele) => acc + ele.steps.length + 2, 0) }</li> -->
    <DebugInfo bind:debugInfo />
  {/if}
</main>

<BpmDialog
  bind:opened={bpmDialogOpened}
  bind:value={bpmDialogValue}
  on:ok={() => {
    if (bpmDialogValue) {
      bpms.set(lastPointerTick, bpmDialogValue)
      bpms = bpms
    }
  }}
  on:delete={() => {
    bpms.delete(lastPointerTick)
    bpms = bpms
  }}
/>

<ControlHandler
  bind:playhead
  bind:zoom
  bind:paused
/>

<svelte:window
  bind:innerHeight
/>

<style>
  /* Global Styles */
  :global(body) {
    background: var(--color-background-main);
    color: var(--color-text-main);
    font-family: 'FOT-RodinNTLG Pro';
  }

  /* Main */
  main {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
  }  

  .canvas-container {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: hidden;
    display: grid;
    grid-template-columns: 1fr auto;
    position: relative;
    background: linear-gradient(180deg, rgb(11.24% 0% 29.08%) 0%, rgb(6.27% 0% 14.83%) 100%);
  }

  :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .zoom-indicator-container {
    height: 100%;
    padding: 1em;
    display: flex;    
    flex-direction: column;
    justify-content: end;
  }

  .cursor-select {
    cursor: url('$assets/select-cursor.png') 13 13, auto
  }
</style>

<slot></slot>