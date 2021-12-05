/// <reference types="@sveltejs/kit" />
interface ImportMeta {
  env: {
    PACKAGE_VERSION: string,
    DEV: boolean
  }
}

declare module '@pixi/events' {
  type PointerEvents = 'pointerdown' | 'pointerup' | 'click'
  export interface FederatedEventTarget {
    addEventListener<T extends PointerEvents>(type: T, listener: (event:  FederatedPointerEvent) => void): void
  }
}

import type { EventSystem, FederatedEvent, FederatedPointerEvent } from '@pixi/events'

declare module 'pixi.js' {
  export interface Renderer {
    events: EventSystem
  }
  export interface AbstractRenderer {
    events: EventSystem
  }

  export * from '@pixi/events'
}
