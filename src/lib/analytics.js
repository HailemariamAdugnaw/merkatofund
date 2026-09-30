import { api } from './api'

let initialized = false

export function initAnalytics(measurementId) {
  if (!measurementId || initialized) {
    return
  }
  initialized = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: true })
}

export function trackEvent(name, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
  api.trackEvent({
    name,
    path: window.location.hash || window.location.pathname,
    metadata: params
  })
}
