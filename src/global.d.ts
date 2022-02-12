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

declare module 'core-js/actual/array/at.js' {
  /**
   * Takes an integer value and returns the item at that index,
   * allowing for positive and negative integers.
   * Negative integers count back from the last item in the array.
   */
  declare function at<T>(array: Array<T>, index: number): T | undefined
  export default at
}