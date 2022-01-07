import { cartesianProduct } from '$lib/basic/math'

import { SimplePlane } from 'pixi.js'
import type { Texture, Resource } from 'pixi.js'

const TEXTURE_WIDTH = 354
const TEXTURE_HEIGHT = 186
const SIDE_WIDTH = 53
const SIDE_HEIGHT = 53
const SIDE_RATIO_X = SIDE_WIDTH / TEXTURE_WIDTH
const SIDE_RATIO_Y = SIDE_HEIGHT / TEXTURE_HEIGHT
const SLICE_X = 91
const SLICE_RATIO_X = SLICE_X / TEXTURE_WIDTH

const SLICE_T = 72
const SLICE_B = 80
const SLICE_RATIO_T = SLICE_T / TEXTURE_HEIGHT
const SLICE_RATIO_B = SLICE_B / TEXTURE_HEIGHT

export class NotePlane extends SimplePlane {
  constructor(texture: Texture<Resource>) {
    super(texture, 6, 6)

    this.uvCoords = new Float32Array(cartesianProduct([
      [0, SIDE_RATIO_X, SLICE_RATIO_X, 1 - SLICE_RATIO_X, 1 - SIDE_RATIO_X, 1],
      [0, SIDE_RATIO_Y, SLICE_RATIO_T, 1 - SLICE_RATIO_B, 1 - SIDE_RATIO_Y, 1]
    ]).flat())
  }

  get uvCoords() {
    return this.geometry.getBuffer('aTextureCoord').data
  }

  set uvCoords(value) {
    this.geometry.getBuffer('aTextureCoord').update(value)
  }

  get vertices() {
    return this.geometry.getBuffer('aVertexPosition').data
  }

  set vertices(value) {
    this.geometry.getBuffer('aVertexPosition').update(value)
  }

  updateTexture(texture: Texture<Resource>) {
    this.texture = texture
  }

  update(x: number, y: number, width: number, height: number) {
    const borderL = x - width / 2
    const borderR = x + width / 2
    const borderT = y - height / 2
    const borderB = y + height / 2

    const BASE_WIDTH = 130

    const sideX = BASE_WIDTH * SIDE_RATIO_X
    const sliceX = BASE_WIDTH * SLICE_RATIO_X
  
    const middleX = sliceX - sideX
    
    const BASE_HEIGHT = 60

    const sideY = BASE_HEIGHT * SIDE_RATIO_Y
    const sliceT = BASE_HEIGHT * SLICE_RATIO_T
    const sliceB = BASE_HEIGHT * SLICE_RATIO_B

    const middleT = sliceT - sideY
    const middleB = sliceB - sideY

    this.vertices = new Float32Array(cartesianProduct([
      [borderL - sideX, borderL, borderL + middleX, borderR - middleX, borderR, borderR + sideX],
      [borderT - sideY, borderT, borderT + middleT, borderB - middleB, borderB, borderB + sideY]
    ]).flat())
  }
}