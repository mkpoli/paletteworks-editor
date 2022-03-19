import { detectLocale } from '$i18n/i18n-util'
import type { GetSession, RequestEvent } from '@sveltejs/kit'
import { initAcceptLanguageHeaderDetector } from 'typesafe-i18n/detectors'

const getHeaders = (event: RequestEvent) => {
  const headers: Record<string, string> = {}
  event.request.headers.forEach((value, key) => { headers[key] = value })

  return headers
}

export const getSession: GetSession = (event) => {
  // detect the preferred language the user has configured in his browser
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
  const headers = getHeaders(event)
  const acceptLanguageDetector = initAcceptLanguageHeaderDetector({ headers })
  const locale = detectLocale(acceptLanguageDetector)

  return {
    locale,
  }
}
