/// <reference types="@sveltejs/kit" />
interface ImportMeta {
  env: {
    PACKAGE_VERSION: string,
    DEV: boolean
  }
}

import type { EventSystem, FederatedEvent } from '@pixi/events'

declare module 'pixi.js' {
  export interface Renderer {
    events: EventSystem
  }
  export interface AbstractRenderer {
    events: EventSystem
  }

  export * from '@pixi/events'
}
