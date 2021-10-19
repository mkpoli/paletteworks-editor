// Types
import type PIXI from 'pixi.js' 
import type { Mode } from '$lib/editing'

// Consts
import COLORS from '$lib/colors'
import {
  BEAT_IN_MEASURE,
  MARGIN_BOTTOM,
  LANE_WIDTH,
  LANE_AREA_WIDTH,
  TEXT_MARGIN,
  MARGIN,
  FONT_FAMILY,
  NOTE_HEIGHT,
  NOTE_WIDTH,
  NOTE_PIVOT,
  DIAMOND_PIVOT,
  DIAMOND_HEIGHT,
  DIAMOND_WIDTH,
  MEASURE_HEIGHT,
} from '$lib/consts'
import { calcY } from '$lib/timing'
import { MODE_TEXTURES } from '$lib/editing'

// Drawing Functions
export function drawDashedLine(graphics: PIXI.Graphics, fromX: number, fromY: number, toX: number, toY: number, dash = 10, gap = 8) {
  graphics.moveTo(fromX, fromY);
  const currentPosition = {
    x: fromX,
    y: fromY
  }

  for (
    ;
    Math.abs(currentPosition.x) < toX ||
    Math.abs(currentPosition.y) < toY;
  ) {
    currentPosition.x =
      Math.abs(currentPosition.x + dash) < toX
        ? currentPosition.x + dash
        : toX;
    currentPosition.y =
      Math.abs(currentPosition.y + dash) < toY
        ? currentPosition.y + dash
        : toY;

    graphics.lineTo(currentPosition.x, currentPosition.y);

    currentPosition.x =
      Math.abs(currentPosition.x + gap) < toX
        ? currentPosition.x + gap
        : toX;
    currentPosition.y =
      Math.abs(currentPosition.y + gap) < toY
        ? currentPosition.y + gap
        : toY;

    graphics.moveTo(currentPosition.x, currentPosition.y);
  }
}

export function drawBackground(
  PIXI: typeof import('pixi.js'),
  graphics: PIXI.Graphics,
  measureHeight: number,
  topY: number,
  maxMeasure: number,
  innerHeight: number
) {
  graphics.removeChildren()
  graphics.clear()

  // Draw lanes
  for (let i = 1; i < 14; i++) {
    const x = MARGIN + i * LANE_WIDTH
    if (i % 2 != 0) {
      graphics.lineStyle(2, COLORS.COLOR_LANE_PRIMARY, 1, 0.5)
    } else {
      graphics.lineStyle(1, COLORS.COLOR_LANE_SECONDARY, 1, 0.5)
    }
    graphics.moveTo(x, innerHeight)
    graphics.lineTo(x, topY - MEASURE_HEIGHT / BEAT_IN_MEASURE)
  }

  // Draw bars
  for (let i = 0; i < maxMeasure * BEAT_IN_MEASURE + 1 ; i++) {
    const y = innerHeight - (MARGIN_BOTTOM + i * measureHeight / BEAT_IN_MEASURE)

    if (i % BEAT_IN_MEASURE == 0) {
      graphics.lineStyle(2, COLORS.COLOR_BAR_PRIMARY, 1, 0.5)
      graphics.moveTo(MARGIN, y)
      graphics.lineTo(MARGIN + LANE_AREA_WIDTH, y)

      const number = i / BEAT_IN_MEASURE
      const text = new PIXI.Text(`#${number + 1}`, {
        fill: 'white'
      })
      text.x = MARGIN - TEXT_MARGIN
      text.y = y
      text.anchor.x = 1
      text.anchor.y = 0.5
      graphics.addChild(text)
    } else {
      graphics.lineStyle(1, COLORS.COLOR_BAR_SECONDARY, 1, 0.5)
      graphics.moveTo(MARGIN + LANE_WIDTH, y)
      graphics.lineTo(MARGIN + LANE_AREA_WIDTH - LANE_WIDTH, y)
    }
  }
}



export function drawBPMs(graphics: PIXI.Graphics, pixi, bpms: Map<number, number>, measureHeight: number) {
  graphics.clear()
  graphics.lineStyle(1, COLORS.COLOR_BPM, 1)
  graphics.removeChildren()

  // Draw BPMs
  bpms.forEach((bpm, tick) => {
    const newY = calcY(tick, measureHeight)

    // Draw BPM LINES
    graphics.moveTo(MARGIN, newY)
    graphics.lineTo(MARGIN + LANE_AREA_WIDTH, newY)

    // Draw BPM Texts
    const text: PIXI.Text = graphics.addChild(new pixi.Text(`𝅘𝅥=${bpm}`, {
        fill: COLORS.COLOR_BPM,
        fontSize: 20,
        fontFamily: FONT_FAMILY
      }))
    text.anchor.set(0.5, 0.5)

    text.setTransform(MARGIN + LANE_AREA_WIDTH + LANE_WIDTH + TEXT_MARGIN, newY)
  })
}

let lastText: PIXI.Text

export function drawSnappingElements(
  graphics: PIXI.Graphics, pixi, TEXTURES: Record<string, PIXI.Texture>,
  currentMode: Mode, x:number, y: number, hasBPM: boolean
) {
  graphics.clear()
  if (lastText && !lastText.destroyed) {
    lastText.destroy()
  }
  graphics.removeChildren()

  if (currentMode == 'select') {
    return
  }

  if (currentMode == 'bpm') {
    const text = new pixi.Text(hasBPM ? `↑ BPM` : `+ BPM`, {
      fill: COLORS.COLOR_BPM,
      fontSize: 20
    })
    text.anchor.set(0.5, 0.5)
    text.setTransform(MARGIN + LANE_AREA_WIDTH + 3 * TEXT_MARGIN, hasBPM ? y + 25 : y)
    lastText = graphics.addChild(text)
    
    if (!hasBPM) {
      graphics.lineStyle(2, COLORS.COLOR_BPM, 1)
      drawDashedLine(graphics, MARGIN, y, MARGIN + LANE_AREA_WIDTH, y)
    }
    return
  }

  if (currentMode === 'flick') {
    const flickArrow: PIXI.Sprite = new pixi.Sprite(
      TEXTURES['notes_flick_arrow_02.png']
    )
    flickArrow.anchor.set(0.5, 0.5)
    flickArrow.setTransform(x, y - 45)
    flickArrow.alpha = 0.5
    flickArrow.height = 0.75 * NOTE_HEIGHT
    flickArrow.width = NOTE_WIDTH
    graphics.addChild(flickArrow)
  }

  const floating: PIXI.Sprite = new pixi.Sprite(
    TEXTURES[currentMode === 'flick' ? 'noteF.png' : MODE_TEXTURES[currentMode]]
  )
  floating.anchor.set(0.5, 0.5)
  floating.setTransform(x, y)
  
  switch (currentMode) {
    case 'tap':
    case 'flick':
    case 'slide':
    case 'critical': {
      const [NOTE_PIVOT_X, NOTE_PIVOT_Y] = NOTE_PIVOT
      floating.pivot.set(NOTE_PIVOT_X, NOTE_PIVOT_Y)
      floating.height = NOTE_HEIGHT
      floating.width = NOTE_WIDTH * 2
      break
    }
    case 'mid': {
      const [DIAMOND_PIVOT_X, DIAMOND_PIVOT_Y] = DIAMOND_PIVOT
      floating.pivot.set(DIAMOND_PIVOT_X, DIAMOND_PIVOT_Y)
      floating.height = DIAMOND_HEIGHT
      floating.width = DIAMOND_WIDTH
    }
  }

  floating.alpha = 0.5
  graphics.addChild(floating)
  // floating.setTransform(MARGIN + LANE_AREA_WIDTH + 3 * TEXT_MARGIN, y)
}

export function createGradientCanvas(width: number, height: number, colors: string[]) {
  const canvas = document.createElement('canvas')  
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, height)

  canvas.setAttribute('width', `${width}px`)
  canvas.setAttribute('height', `${height}px`)

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (color.length - 1), color)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  return canvas
}

import playheadImage from '$assets/playhead.png'
export function drawPlayhead(graphics: PIXI.Graphics, pixi, y: number) {
  graphics.clear()
  graphics.removeChildren()
  graphics.lineStyle(2, COLORS.COLOR_PLAYHEAD, 1)
  const playhead = pixi.Sprite.from(playheadImage)
  playhead.anchor.set(1, 0.5)
  playhead.setTransform(MARGIN, y)
  graphics.addChild(playhead)
  drawDashedLine(graphics, MARGIN, y, MARGIN + LANE_AREA_WIDTH, y, 2, 2)
  return 
}
