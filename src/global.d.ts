/// <reference types="@sveltejs/kit" />
/// <reference types="core-js" />
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

