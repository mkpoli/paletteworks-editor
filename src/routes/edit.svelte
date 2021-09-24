<script lang="ts" context="module">
  export const ssr = false;
	export async function load({ page, fetch, session, context }) {
		// const url = `/RelayPoint.sus`;
		// const url = `/NewScore2.sus`;
    // const url = `KING.sus`;
    // const url = `/TellYourWorld_EX.sus`;
    const url = `MultipleBPM.sus`;
    // const url = `SlideTest.sus`;
    // const url = `ModNote.sus`;
		const res = await fetch(url);

		if (res.ok) {
			return {
				props: {
					data: await res.text()
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

  // Types
  import type { Mode, SnapTo } from '$lib/editing'
  import type { MetaData } from '$lib/beatmap'
  import type { Score } from '$lib/sus/analyze'
  import type PIXI from 'pixi.js' 

  // Imports
  import COLORS from '$lib/colors'
  import { getMetaData, getScoreData, convertScoreData } from '$lib/sus/susIO'
  import { onMount } from 'svelte';
  import {
    MARGIN,
    MARGIN_BOTTOM,
    TEXT_MARGIN,
    LANE_AREA_WIDTH,
    BAR_LENGTH,
    TEXTURE_NAMES,
    CANVAS_WIDTH
  } from '$lib/consts'

  // Calculations
  import { calcX, calcY } from '$lib/timing'
  import { snap } from '$lib/editing'
  // Data
  export let data;
  let metadata: MetaData
  let score: Score

  // PIXI.js
  let PIXI
  let app: PIXI.Application

  // Playhead & Measures
  $: measureHeight = BAR_LENGTH * zoom
  
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

  const TEXTURES: Record<string, PIXI.Texture> = {}

  let mouseX: number
  let mouseY: number

  onMount(async () => {
    PIXI = await import('pixi.js')

    app = new PIXI.Application({
      width: CANVAS_WIDTH,
      height: innerHeight,
      antialias: true,
      resolution: 2
    })

    for (const name of TEXTURE_NAMES) {
      TEXTURES[name] = PIXI.Texture.from(name)
    }

    app.stage.interactive = true
    app.stage.addListener('mousemove', (event: PIXI.InteractionEvent) => {
      const { x, y } = event.data.global
      mouseX = x
      mouseY = y
    })
  })

  metadata = getMetaData(data)
  score = getScoreData(data)
  const { singleNotes, slides, bpms } = convertScoreData(score)
  console.log(score)
  console.log({ slides, bpms })

  import { Pixi, Text, Loader, Sprite, Graphics } from 'svelte-pixi'
  import { drawBackground, drawSlidePath, drawBPMs, drawSnappingElements } from '$lib/renderer';

  let canvasContainer: HTMLDivElement
  
  const NOTE_PIVOT = [0.14971751412, 0.5]
  const NOTE_WIDTH = 43
  const NOTE_HEIGHT = 60

  const DIAMOND_PIVOT = [0.15189873417, 0.5]
  const DIAMOND_WIDTH = 30
  const DIAMOND_HEIGHT = 30 / 158 * 160
  

  let files: FileList
  let player: HTMLAudioElement
  let currentTime: number
  let paused: boolean

  // let currentMode: Mode = 'select' // TODO:
  let currentMode: Mode = 'bpm'
  let snapTo: SnapTo

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

  $: dbg('mouse', formatPoint(mouseX, mouseY))
  $: dbg('stage.pivot', formatPoint(app?.stage.pivot.x, app?.stage.pivot.y))
  $: dbg('playhead', playhead)
</script>

<svelte:head>
  <title>PaletteWorks Editor</title>
</svelte:head>

<main>
  {#if app}
    <ToolBox
      bind:currentMode
      bind:snapTo
    />
    <div class="canvas-container" bind:this={canvasContainer} style={`width: ${CANVAS_WIDTH}px;`}>
      <Pixi {app}>
        <Loader resources={TEXTURE_NAMES}>
          <!-- <Sprite
            texture={PIXI.Texture.from('bg.png')}
            anchor={new PIXI.Point(0, 0)}
            x={0}
            y={0}
          /> -->
          <Graphics
            x={MARGIN}
            y={0}
            draw={(graphics) => { drawBackground(graphics, measureHeight, fullHeight, score.maxMeasure) }}
          />

          <!-- BPM -->
          <Graphics
            x={MARGIN}
            y={0}
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
            {#if flick}
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
                  : flick
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
            {#if end.flick}
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
                  : end.flick
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
            x={MARGIN}
            y={0}
            draw={(graphics) => {
              const transformedY = mouseY - playhead + MARGIN_BOTTOM
              const step = measureHeight / snapTo
              drawSnappingElements(
                graphics, PIXI, currentMode, measureHeight,
                innerHeight - snap(innerHeight - transformedY, step) - MARGIN_BOTTOM
              )
              // graphics.moveTo(0, transformedY)
              // graphics.lineTo(LANE_AREA_WIDTH, transformedY)
              dbg('currentMode', currentMode)
              dbg(`snapTo`, snapTo)
              dbg('step', step)
              dbg(`snapV1`, innerHeight - snap(innerHeight - mouseY - playhead + MARGIN_BOTTOM, measureHeight / snapTo) - MARGIN_BOTTOM)
              dbg(`snapV2`, innerHeight - snap(innerHeight - mouseY - playhead, measureHeight / snapTo) + MARGIN_BOTTOM - MARGIN_BOTTOM)
              dbg(`snapV3`, snap(mouseY + playhead, measureHeight / snapTo) + MARGIN_BOTTOM - MARGIN_BOTTOM)
              dbg(`nosnap`, innerHeight - (innerHeight - mouseY - playhead + MARGIN_BOTTOM) - MARGIN_BOTTOM)
              dbg(`nosnap2`, innerHeight - innerHeight + mouseY + playhead - MARGIN_BOTTOM - MARGIN_BOTTOM)
            }}
          />  
        </Loader>
      </Pixi>
    </div>
    <div class="zoom-indicator-container">
      <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={0.1} />
    </div>
    <PropertyBox
      bind:playhead
      bind:currentMeasure
      on:goto={() => {
        console.log('GOTO')
        if (currentMeasure >= 1 && currentMeasure <= score.maxMeasure + 2) {
          playhead = (currentMeasure - 1) * measureHeight
        } else {
          // TODO: Popup
        }
      }}
      statistics={{
        'Taps': singleNotes.filter((x) => !x.flick).length,
        'Flicks': singleNotes.filter((x) => x.flick).length,
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
    background: #2e3142;
    color: #eeeeee;
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
    display: flex;
    position: relative;
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
    background: black;
  }
</style>

<slot></slot>