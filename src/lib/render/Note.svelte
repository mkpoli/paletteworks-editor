<script lang="ts">
  import { NOTE_HEIGHT } from '$lib/consts'
  import { getContext, onMount } from "svelte"

  import type PIXI from 'pixi.js'

  type Type = 'tap' | 'critical' | 'flick' | 'slide'

  export let x: number
  export let y: number
  export let width: number
  export let type: Type
  export let alpha: number = 1
  export let tint: number = 0xFFFFFF

  const NOTE_TEXTURE: Record<Type, string> = {
    tap: 'noteN.png',
    critical: 'noteC.png',
    flick: 'noteF.png',
    slide: 'noteL.png',
  }

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  // Variables
  let instance: PIXI.NineSlicePlane

  onMount(async () => {
    const texture = TEXTURES[NOTE_TEXTURE[type]]
    instance = new PIXI.NineSlicePlane(
      texture,
      100, 0, 100, 0
    )
    instance.height = NOTE_HEIGHT
    instance.pivot.y = NOTE_HEIGHT * 0.5
    instance.scale.x = 0.25
    instance.scale.y = 1
    instance.zIndex = 1
    instance.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    app.stage.addChild(instance)

    return () => {
      app.stage.removeChild(instance)
    }
  })

  $: if (instance) {
    instance.tint = tint
    instance.alpha = alpha
    instance.texture = TEXTURES[NOTE_TEXTURE[type]]
    instance.x = x
    instance.y = y
    instance.width = width
    instance.pivot.x = width * 0.5
  }
</script>
