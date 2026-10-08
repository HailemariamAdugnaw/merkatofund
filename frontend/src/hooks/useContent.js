import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { fallbackAppDownload, fallbackArticles, fallbackHeroSlides, fallbackSettings } from '../data/fallback'

export function useContent() {
  const [articles, setArticles] = useState(fallbackArticles)
  const [heroSlides, setHeroSlides] = useState(fallbackHeroSlides)
  const [settings, setSettings] = useState(fallbackSettings)
  const [appDownload, setAppDownload] = useState(fallbackAppDownload)
  const [source, setSource] = useState('default')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [articleData, slideData, settingData, appDownloadData] = await Promise.all([
          api.articles(),
          api.heroSlides(),
          api.settings(),
          api.appDownload()
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
        if (appDownloadData && typeof appDownloadData === 'object') {
          setAppDownload((current) => ({ ...current, ...appDownloadData }))
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

  return { articles, heroSlides, settings, appDownload, source }
}
