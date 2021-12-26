/// <reference types="@sveltejs/kit" />
interface ImportMeta {
  env: {
    PACKAGE_VERSION: string,
    DEV: boolean
  }
}

declare module 'bpm-detective' {
  declare function detect(data: AudioBuffer): number
  export default detect
}

declare module '@pixi/events' {
  type PointerEvents = 'pointerdown' | 'pointerup' | 'pointermove' | 'pointerenter' | 'pointerleave' | 'click'
  export interface FederatedEventTarget {
    addEventListener<T extends PointerEvents>(type: T, listener: (event:  FederatedPointerEvent) => void): void
  }
}

declare module 'pixi.js' {
  import type { EventSystem } from '@pixi/events'

  export interface Renderer {
    events: EventSystem
  }
  export interface AbstractRenderer {
    events: EventSystem
  }

  export * from '@pixi/events'
}
