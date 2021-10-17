// Types
import type PIXI from 'pixi.js' 
import type { Slide, SlideNote, SlideStart, SlideStep } from '$lib/score/beatmap'
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
import { calcMidX, calcX, calcY } from '$lib/timing'
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


const EASE_RATIOS = {
  curved: 0.5,
  straight: 0
}
const SHRINK_WIDTH = LANE_WIDTH / 8

export function drawSlidePath(graphics: PIXI.Graphics, slideNotes: SlideNote[], critical: boolean, measureHeight: number) {
  graphics.clear()
  slideNotes
  .reduce((acc: [SlideNote, SlideNote][], ele: SlideNote, ind: number, arr: SlideNote[]) => {
      if (ind < arr.length - 1) {
        acc.push([arr[ind], arr[ind + 1]])
      }
      return acc
    }, [] as [SlideNote, SlideNote][])
    .forEach(([origin, target]) => {
      const easeInRatio = 'easeType' in origin && origin.easeType === 'easeIn' ? EASE_RATIOS.curved : EASE_RATIOS.straight
      const easeOutRatio = 'easeType' in origin && origin.easeType === 'easeOut' ? EASE_RATIOS.curved : EASE_RATIOS.straight

      const origin_x_left = calcX(origin.lane) + SHRINK_WIDTH
      const origin_x_right = calcX(origin.lane) + origin.width * LANE_WIDTH - SHRINK_WIDTH
      const origin_y = calcY(origin.tick, measureHeight) 
      
      const target_x_left = calcX(target.lane) + SHRINK_WIDTH
      const target_x_right = calcX(target.lane) + target.width * LANE_WIDTH - SHRINK_WIDTH
      const target_y = calcY(target.tick, measureHeight)

      graphics.beginFill(critical ? COLORS.COLOR_SLIDE_PATH : COLORS.COLOR_SLIDE_PATH_CRITICAL, COLORS.ALPHA_SLIDE_PATH)
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

function createDiamond(
  PIXI: typeof import('pixi.js'), TEXTURES: Record<string, PIXI.Texture>, x: number, y: number, critical: boolean
): PIXI.Sprite {
  const sprite = new PIXI.Sprite(TEXTURES[`notes_long_among${critical ? '_crtcl' : ''}.png`])
  sprite.x = x
  sprite.y = y
  sprite.anchor.x = 0.5 
  sprite.anchor.y = 0.5
  sprite.width = DIAMOND_WIDTH
  sprite.height = DIAMOND_HEIGHT
  return sprite
}

export function drawDiamonds(
  slide: Slide, measureHeight: number, container: PIXI.Container, PIXI: typeof import('pixi.js'), TEXTURES: Record<string, PIXI.Texture>
) {
  container.removeChildren()

  const { start, end, critical, steps } = slide

  let currentGroup: SlideNote[] = [start];
  const connectedGroups = [...steps, end]
    .reduce((acc: SlideNote[][], ele: SlideNote) => {
      currentGroup.push(ele)
      if (!('ignored' in ele) || !ele.ignored) {
        acc.push([...currentGroup])
        currentGroup = [ele]
      }
      return acc
    }, [])
    .filter((a: SlideNote[]) => a.length >= 3)

  connectedGroups
    .forEach((arr: SlideNote[]) => {
      const origin = arr.shift() as SlideStart | SlideStep
      const originX = calcMidX(origin.lane, origin.width)
      const originY = calcY(origin.tick, measureHeight)

      const target = arr.pop()
      const targetX = calcMidX(target.lane, target.width)
      const targetY = calcY(target.tick, measureHeight)

      if ('diamond' in origin && origin.diamond) {
        container.addChild(createDiamond(PIXI, TEXTURES, originX, originY, critical))
      }

      arr
        .filter((current: SlideStep) => current.diamond)
        .forEach((current) => {
          const currentY = calcY(current.tick, measureHeight)

          const a = (targetY - originY) / Math.pow(targetX - originX, 2)

          
          let currentX: number

          switch (origin.easeType) {
            case 'easeIn':
              currentX = (originX > targetX ? 1 : -1) * Math.abs(Math.sqrt((currentY - targetY) / -a)) + targetX
              break
            case 'easeOut':
              currentX = (originX > targetX ? -1 : 1) * Math.abs(Math.sqrt((currentY - originY) / a)) + originX
              break
            default:
              currentX = ((currentY - originY) / (targetY - originY)) * (targetX - originX) + originX
              break
          }
          container.addChild(createDiamond(PIXI, TEXTURES, currentX, currentY, critical))
        })
    })
}