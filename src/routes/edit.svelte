<script lang="ts" context="module">
  export const ssr = false;
	export async function load({ page, fetch, session, context }) {
		// const url = `/RelayPoint.sus`;
		// const url = `/NewScore2.sus`;
    // const url = `KING.sus`;
    const url = `/TellYourWorld_EX.sus`;
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

  // Types
  import type { Mode } from '$lib/ToolBox.svelte'
  import type { MetaData, SlideEnd, SlideStart, SlideStep } from '$lib/beatmap'
  import type { NoteObject, Score } from '$lib/sus/analyze'
  import type { Application, Graphics as GraphicsType, Texture } from 'pixi.js' 

  // Imports
  import COLORS from '$lib/colors'
  import { getMetaData, getScoreData, convertScoreData } from '$lib/sus/susIO'
  import { onMount, tick } from 'svelte';
  export let data;
  let metadata: MetaData
  let score: Score

  let PIXI
  let app: Application

  const BEAT_UNIT = 4
  const BEAT_IN_BAR = 4

  const MARGIN = 80
  const MARGIN_BOTTOM = 30
  const TEXT_MARGIN = -15

  const LANE_WIDTH = 30
  const LANE_COUNT = 16
  const LANE_AREA_WIDTH = LANE_WIDTH * LANE_COUNT

  const BAR_LENGTH = 500

  $: measureHeight = BAR_LENGTH * zoom
  
  let playhead = -MARGIN_BOTTOM
  $: if (playhead < 0) playhead = 0
  $: if (playhead >= fullHeight) playhead = fullHeight

  $: currentMeasure = Math.floor(playhead / measureHeight  + 1)

  let gotoMeasure: number

  let zoom = 1
  const ZOOM_MIN = 0.1
  const ZOOM_MAX = 10.0
  $: if (zoom <= ZOOM_MIN) zoom = ZOOM_MIN
  $: if (zoom >= ZOOM_MAX) zoom = ZOOM_MAX
  $: zoom && playhead
  
  
  $: if (app) {
    app.stage.pivot.y = MARGIN_BOTTOM - playhead
  }
  
  
  const WIDTH = MARGIN * 2 + LANE_AREA_WIDTH
  $: fullHeight = score ? (score.maxMeasure + 1) * measureHeight : 0
  let innerHeight: number
  // Resize when width / viewHeight changed
  $: if (app) {
    app.renderer.resize(WIDTH, innerHeight)
  }

  const TEXTURE_NAMES = [
    'noteC.png',
    'noteF.png',
    'noteL.png',
    'noteN.png',
    'notes_flick_arrow_01.png',
    'notes_flick_arrow_01_diagonal.png',
    'notes_flick_arrow_02.png',
    'notes_flick_arrow_02_diagonal.png',
    'notes_flick_arrow_03.png',
    'notes_flick_arrow_03_diagonal.png',
    'notes_flick_arrow_04.png',
    'notes_flick_arrow_04_diagonal.png',
    'notes_flick_arrow_05.png',
    'notes_flick_arrow_05_diagonal.png',
    'notes_flick_arrow_06.png',
    'notes_flick_arrow_06_diagonal.png',
    'notes_flick_arrow_crtcl_01.png',
    'notes_flick_arrow_crtcl_01_diagonal.png',
    'notes_flick_arrow_crtcl_02.png',
    'notes_flick_arrow_crtcl_02_diagonal.png',
    'notes_flick_arrow_crtcl_03.png',
    'notes_flick_arrow_crtcl_03_diagonal.png',
    'notes_flick_arrow_crtcl_04.png',
    'notes_flick_arrow_crtcl_04_diagonal.png',
    'notes_flick_arrow_crtcl_05.png',
    'notes_flick_arrow_crtcl_05_diagonal.png',
    'notes_flick_arrow_crtcl_06.png',
    'notes_flick_arrow_crtcl_06_diagonal.png',
    'notes_long_among.png',
    'notes_long_among_crtcl.png'
  ]
  const TEXTURES: Record<string, Texture> = {}


  let mouseX: number
  let mouseY: number

  // import * as  PIXI from 'pixi.js'
  onMount(async () => {
    PIXI = await import('pixi.js')

    app = new PIXI.Application({
      width: WIDTH,
      height: innerHeight,
      antialias: true
    })

    for (const name of TEXTURE_NAMES) {
      TEXTURES[name] = PIXI.Texture.from(name)
    }

    app.stage.interactive = true
    app.stage.addListener('mousemove', (event) => {
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
  import { drawDashedLine } from '$lib/renderer';


  function drawBackground(graphics: GraphicsType, zoom: number) {   
    graphics.clear()
    
    // Draw lanes
    for (let i = 0; i < LANE_COUNT + 1; i++) {
      const x = i * LANE_WIDTH
      if (i <= 1 || i >= LANE_COUNT + 1 - 2) {
        continue
      }
      if (i % 2 == 0) {
        graphics.lineStyle(2, 0xFFFFFF, 1, 0.5)
      } else {
        graphics.lineStyle(1, 0xCCCC0C, 1, 0.5)
      }
      graphics.moveTo(x, innerHeight)
      graphics.lineTo(x, -fullHeight)
    }

    // Draw bars
    for (let i = 0; i < (score.maxMeasure + 2) * 3 + 2 ; i++) {
      const y = innerHeight - (MARGIN_BOTTOM + i * measureHeight / BEAT_IN_BAR)

      if (i % BEAT_IN_BAR == 0) {
        graphics.lineStyle(2, 0xFFFFFF, 1, 0.5)
        graphics.moveTo(LANE_WIDTH, y)
        graphics.lineTo(LANE_AREA_WIDTH - LANE_WIDTH, y)
      } else {
        graphics.lineStyle(1, 0xCCCCCC, 1, 0.5)
        graphics.moveTo(LANE_WIDTH + LANE_WIDTH, y)
        graphics.lineTo(LANE_AREA_WIDTH - 2 * LANE_WIDTH, y)
      }
    }
  }

  let canvasContainer: HTMLDivElement
  
  const NOTE_PIVOT = [0.14971751412, 0.5]
  const NOTE_WIDTH = 43
  const NOTE_HEIGHT = 60

  const DIAMOND_PIVOT = [0.15189873417, 0.5]
  const DIAMOND_WIDTH = 30
  const DIAMOND_HEIGHT = 30 / 158 * 160
  
  function calcX(lane: number) {
    // return MARGIN + lane * 30 - 12
    return MARGIN + lane * 30
  }


  function calcY(tick: number, zoom: number) {
    return innerHeight - (MARGIN_BOTTOM + (tick / 480) * measureHeight / 4)
  }

  const EASE_RATIOS = {
    curved: 0.5,
    straight: 0
  }

  const SHRINK_WIDTH = LANE_WIDTH / 8
  type SlideNode = SlideStart | SlideStep | SlideEnd
  function drawSlidePath(graphics: GraphicsType, slideNotes: SlideNode[], critical: boolean, zoom: number) {
    graphics.clear()
    slideNotes
    .reduce((acc: [SlideNode, SlideNode][], ele: SlideNode, ind: number, arr: SlideNode[]) => {
        if (ind < arr.length - 1) {
          acc.push([arr[ind], arr[ind + 1]])
        }
        return acc
      }, [] as [SlideNode, SlideNode][])
      .forEach(([origin, target]) => {
        const easeInRatio = 'easeType' in origin && origin.easeType === 'easeIn' ? 0.5 : 0
        const easeOutRatio = 'easeType' in origin && origin.easeType === 'easeOut' ? 0.5 : 0

        const origin_x_left = calcX(origin.lane) + SHRINK_WIDTH
        const origin_x_right = calcX(origin.lane) + origin.width * LANE_WIDTH - SHRINK_WIDTH
        const origin_y = calcY(origin.tick, zoom) 
        
        const target_x_left = calcX(target.lane) + SHRINK_WIDTH
        const target_x_right = calcX(target.lane) + target.width * LANE_WIDTH - SHRINK_WIDTH
        const target_y = calcY(target.tick, zoom)

        graphics.beginFill(critical ? 0xFFFCCC : 0xDAFDF0, 0.95)
        graphics.moveTo(origin_x_left, origin_y)
        graphics.bezierCurveTo(origin_x_left, origin_y - (origin_y - target_y) * easeInRatio, target_x_left, target_y + (origin_y - target_y) * easeOutRatio, target_x_left, target_y)
        // graphics.moveTo(target_x_left, target_y)
        graphics.lineTo(target_x_right, target_y)
        graphics.bezierCurveTo(target_x_right, target_y + (origin_y - target_y) * easeOutRatio, origin_x_right, origin_y - (origin_y - target_y) * easeInRatio, origin_x_right, origin_y)
        graphics.closePath()
        graphics.endFill()
        // graphics.lineTo(origin_x_right, origin_y)
        // graphics.moveTo(origin_x_right, origin_y)
      })    
  }

  function drawBPM(graphics: GraphicsType, zoom: number, mouseX: number, mouseY: number) {
    graphics.clear()

    graphics.lineStyle(1, COLORS.COLOR_BPM, 1)
    for (const bpm of bpms) {
      const y = calcY(bpm.tick, zoom)
      graphics.moveTo(LANE_WIDTH, y)
      graphics.lineTo(LANE_AREA_WIDTH - LANE_WIDTH, y)
    }

    if (currentMode === 'bpm') {
      const y = mouseY + MARGIN_BOTTOM
      graphics.moveTo(LANE_WIDTH, y);
      // graphics.lineTo(LANE_AREA_WIDTH - LANE_WIDTH, y)
      drawDashedLine(graphics, LANE_AREA_WIDTH - LANE_WIDTH, y)
    }
  }

  let files: FileList
  let player: HTMLAudioElement
  let currentTime: number
  let paused: boolean

  let currentMode: Mode = 'select'
</script>

<svelte:head>
  <title>PaletteWorks Editor</title>
</svelte:head>

<main>
  {#if app}
    <ToolBox bind:currentMode />
    <div class="canvas-container" bind:this={canvasContainer} style={`width: ${WIDTH}px;`}>
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
            draw={(graphics) => { drawBackground(graphics, zoom) }}
          />

          <!-- BPM -->
          {#each bpms as bpm}
            <Text
              text={`${bpm.bpm} BPM`}
              anchor={new PIXI.Point(0, 0.5)}
              x={WIDTH - MARGIN + TEXT_MARGIN}
              y={calcY(bpm.tick, zoom)}
              style={{
                fill: COLORS.COLOR_BPM,
                fontSize: 20
              }}
            />
          {/each}
          <Graphics
            x={MARGIN}
            y={0}
            draw={(graphics) => { drawBPM(graphics, zoom, mouseX, mouseY) }}
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
                y={calcY(tick, zoom) - NOTE_HEIGHT + 10}
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
              y={calcY(tick, zoom)}
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
              draw={(graphics) => {drawSlidePath(graphics, [start, ...steps, end], critical, zoom)}}
            />
            <!-- SLIDE START -->
            <Sprite
              texture={critical ? TEXTURES['noteC.png'] : TEXTURES['noteL.png']}
              anchor={new PIXI.Point(...NOTE_PIVOT)}
              x={calcX(start.lane)}
              y={calcY(start.tick, zoom)}
              width={start.width * NOTE_WIDTH}
              height={NOTE_HEIGHT}
            />

            <!-- SLIDE STEPS -->
            {#each steps as { lane, tick, width }}
              <Sprite
                texture={TEXTURES[`notes_long_among${critical ? '_crtcl' : ''}.png`]}
                anchor={new PIXI.Point(...DIAMOND_PIVOT)}
                x={calcX(lane) + (width * NOTE_WIDTH) / 2 - DIAMOND_WIDTH}
                y={calcY(tick, zoom)}
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
                y={calcY(end.tick, zoom) - NOTE_HEIGHT + 10}
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
              y={calcY(end.tick, zoom)}
              width={end.width * NOTE_WIDTH}
              height={NOTE_HEIGHT}
            />
          {/each}
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
  {/if}
  <div class="debug-display">mouse: ({mouseX}, {mouseY})</div>
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

  input[type='text'] {
    appearance: none;
    border: none;
    border-radius: 5px;
    color: inherit;
    padding: 0.5em 1em;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);
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
  }

  .zoom-indicator-container {
    position: absolute;
    bottom: 1em;
    right: 2em;
  }

  .zoom-indicator-container {
    height: 100%;
    padding: 1em;
    display: flex;    
    flex-direction: column;
    justify-content: end;
    background: black;
  }

  .debug-display {
    position: absolute;
    top: 0;
    left: 0;
    padding: 1em;
    color: black;
    font-size: 0.5em;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
  }
</style>

<slot></slot>