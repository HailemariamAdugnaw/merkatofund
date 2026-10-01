const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://merkatofund.onrender.com'
function buildUrl(path) {
  return `${API_BASE}${path}`
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  if (response.status === 204) {
    return null
  }
  return response.json()
}

export const api = {
  articles: () => request('/api/articles/'),
  heroSlides: () => request('/api/hero-slides/'),
  settings: () => request('/api/settings/'),
  submitContact: (payload) =>
    request('/api/contact/', { method: 'POST', body: JSON.stringify(payload) }),
  trackEvent: (payload) =>
    request('/api/events/', { method: 'POST', body: JSON.stringify(payload) }).catch(() => null)
}
