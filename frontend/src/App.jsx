import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import HeroSlider from './components/HeroSlider.jsx'
import GoldenFlow from './components/GoldenFlow.jsx'
import StatsBar from './components/StatsBar.jsx'
import ArticlesTimeline from './components/ArticlesTimeline.jsx'
import VideoSection from './components/VideoSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import Footer from './components/Footer.jsx'
import FloatingSocial from './components/FloatingSocial.jsx'
import Seo from './components/Seo.jsx'
import { ArrowUpIcon } from './components/Icons.jsx'
import { useContent } from './hooks/useContent'
import { useActiveSection } from './hooks/useActiveSection'
import { initAnalytics, trackEvent } from './lib/analytics'
import { getSocials } from './lib/socials'

export default function App() {
  const { articles, heroSlides, settings, appDownload } = useContent()
  const [activeSection, setActiveSection] = useState('home')
  const readArticlesRef = useRef(new Set())

  useEffect(() => {
    initAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [articles])

  const sectionIds = useMemo(
    () => ['home', ...articles.map((article) => `article-${article.order}`), 'video', 'contact'],
    [articles]
  )
  useActiveSection(sectionIds, setActiveSection)

  const activeOrder = activeSection.startsWith('article-')
    ? Number(activeSection.replace('article-', ''))
    : null

  useEffect(() => {
    if (!activeOrder) return
    const article = articles.find((item) => item.order === activeOrder)
    if (article && !readArticlesRef.current.has(article.slug)) {
      readArticlesRef.current.add(article.slug)
      trackEvent('article_read', { article: article.slug, order: article.order })
    }
  }, [activeOrder, articles])

  const socials = useMemo(() => getSocials(settings), [settings])
  const activeArticle = useMemo(
    () => articles.find((item) => item.order === activeOrder) || null,
    [articles, activeOrder]
  )

  return (
    <>
      <Seo activeArticle={activeArticle} />
      <Navbar articles={articles} activeSection={activeSection} appDownload={appDownload} />
      <main>
        <HeroSlider slides={heroSlides} />
        <GoldenFlow />
        <StatsBar />
        <ArticlesTimeline articles={articles} />
        <VideoSection settings={settings} />
        <ContactSection settings={settings} socials={socials} />
      </main>
      <Footer articles={articles} settings={settings} socials={socials} />
      <FloatingSocial socials={socials} />
      <a
        href="#home"
        className={`back-to-top ${activeSection !== 'home' ? 'is-visible' : ''}`}
        aria-label="Back to top"
      >
        <ArrowUpIcon />
      </a>
    </>
  )
}
