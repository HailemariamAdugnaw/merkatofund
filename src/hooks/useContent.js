import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { fallbackArticles, fallbackHeroSlides, fallbackSettings } from '../data/fallback'

export function useContent() {
  const [articles, setArticles] = useState(fallbackArticles)
  const [heroSlides, setHeroSlides] = useState(fallbackHeroSlides)
  const [settings, setSettings] = useState(fallbackSettings)
  const [source, setSource] = useState('default')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [articleData, slideData, settingData] = await Promise.all([
          api.articles(),
          api.heroSlides(),
          api.settings()
        ])
        if (!active) return
        if (Array.isArray(articleData)) {
          setArticles(articleData)
        }
        if (Array.isArray(slideData)) {
          setHeroSlides(slideData)
        }
        if (settingData && typeof settingData === 'object') {
          setSettings((current) => ({ ...current, ...settingData }))
        }
        setSource('api')
      } catch {
        if (active) {
          setSource('default')
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return { articles, heroSlides, settings, source }
}
