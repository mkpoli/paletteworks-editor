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

