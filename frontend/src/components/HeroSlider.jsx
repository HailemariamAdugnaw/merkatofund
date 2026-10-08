import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics'

const AUTOPLAY_MS = 3500
const FADE_MS = 1200
const SWIPE_THRESHOLD = 48

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(-1)
  const [cycle, setCycle] = useState(0)
  const [paused, setPaused] = useState(false)
  const indexRef = useRef(0)
  const pausedRef = useRef(false)
  const hiddenPauseRef = useRef(false)
  const elapsedRef = useRef(0)
  const startedRef = useRef(Date.now())
  const touchRef = useRef(null)
  const total = slides.length

  indexRef.current = index
  pausedRef.current = paused

  const pauseAutoPlay = useCallback(() => {
    if (pausedRef.current) return
    elapsedRef.current += Date.now() - startedRef.current
    pausedRef.current = true
    setPaused(true)
  }, [])

  const resumeAutoPlay = useCallback(() => {
    if (!pausedRef.current || hiddenPauseRef.current) return
    startedRef.current = Date.now()
    pausedRef.current = false
    setPaused(false)
  }, [])

  const restartCycle = useCallback(
    (nextIndex) => {
      if (total === 0) return
      elapsedRef.current = 0
      startedRef.current = Date.now()
      setLeaving(indexRef.current)
      setIndex(((nextIndex % total) + total) % total)
      setCycle((current) => current + 1)
    },
    [total]
  )

  const goTo = useCallback(
    (next) => {
      if (total === 0) return
      const bounded = ((next % total) + total) % total
      if (bounded === indexRef.current) return
      restartCycle(bounded)
    },
    [total, restartCycle]
  )

  useEffect(() => {
    if (paused || total <= 1) return undefined
    const remaining = Math.max(0, AUTOPLAY_MS - elapsedRef.current)
    const timer = setTimeout(() => {
      restartCycle(indexRef.current + 1)
    }, remaining)
    return () => clearTimeout(timer)
  }, [paused, cycle, index, total, restartCycle])

  useEffect(() => {
    if (leaving < 0) return undefined
    const timer = setTimeout(() => setLeaving(-1), FADE_MS)
    return () => clearTimeout(timer)
  }, [leaving])

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }
      if (event.key === 'ArrowLeft') {
        goTo(indexRef.current - 1)
        trackEvent('hero_slide_change', { direction: 'prev', method: 'keyboard' })
      } else if (event.key === 'ArrowRight') {
        goTo(indexRef.current + 1)
        trackEvent('hero_slide_change', { direction: 'next', method: 'keyboard' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        if (!pausedRef.current) {
          elapsedRef.current += Date.now() - startedRef.current
          hiddenPauseRef.current = true
          pausedRef.current = true
          setPaused(true)
        }
      } else if (hiddenPauseRef.current) {
        hiddenPauseRef.current = false
        startedRef.current = Date.now()
        pausedRef.current = false
        setPaused(false)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const onTouchStart = (event) => {
    touchRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }

  const onTouchEnd = (event) => {
    if (!touchRef.current) return
    const deltaX = event.changedTouches[0].clientX - touchRef.current.x
    const deltaY = event.changedTouches[0].clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return
    if (deltaX < 0) {
      goTo(indexRef.current + 1)
      trackEvent('hero_slide_change', { direction: 'next', method: 'swipe' })
    } else {
      goTo(indexRef.current - 1)
      trackEvent('hero_slide_change', { direction: 'prev', method: 'swipe' })
    }
  }

  const active = slides[index] || {}
  const pad = (value) => String(value).padStart(2, '0')

  if (total === 0) {
    return <section id="home" className="hero hero-empty" aria-label="The Merkato Fund" />
  }

  return (
    <section
      id="home"
      className={`hero ${paused ? 'is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="The Merkato Fund highlights"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') pauseAutoPlay()
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') resumeAutoPlay()
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-stage" aria-hidden="true">
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className={`hero-slide-bg ${slideIndex === index ? 'is-active' : ''} ${
              slideIndex === leaving ? 'is-leaving' : ''
            }`}
          >
            <img
              src={slide.image || `/images/image${slideIndex + 1}.jpg`}
              alt=""
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
        <div className="hero-scrim" />
      </div>

      <div className="container hero-content">
        <div className="hero-copy" key={`copy-${index}`} aria-live="polite">
          <p className="hero-eyebrow">{active.eyebrow}</p>
          <h1 className="hero-title">
            {active.heading} <span className="hero-accent">{active.accent}</span>
          </h1>
          <p className="hero-body">{active.body}</p>
          <div className="hero-actions">
            <a
              className="btn btn-gold btn-lg"
              href={active.cta1_href || '#article-7'}
              onClick={() => trackEvent('hero_cta', { target: active.cta1_href || '#article-7' })}
            >
              {active.cta1_label || 'Join the Movement'}
            </a>
            <a
              className="btn btn-outline btn-lg"
              href={active.cta2_href || '#video'}
              onClick={() => trackEvent('hero_cta', { target: active.cta2_href || '#video' })}
            >
              {active.cta2_label || 'Watch the Video'}
            </a>
          </div>
          <div className="stat-chip">
            <p className="stat-chip-value">{active.stat_value || '5M'}</p>
            <span className="stat-chip-divider" aria-hidden="true" />
            <p className="stat-chip-label">{active.stat_label || 'Birr Daily Liquidity'}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="hero-arrow hero-arrow-prev"
        aria-label="Previous slide"
        onClick={() => {
          goTo(index - 1)
          trackEvent('hero_slide_change', { direction: 'prev', method: 'arrow' })
        }}
      >
        <ChevronLeftIcon />
      </button>
      <button
        type="button"
        className="hero-arrow hero-arrow-next"
        aria-label="Next slide"
        onClick={() => {
          goTo(index + 1)
          trackEvent('hero_slide_change', { direction: 'next', method: 'arrow' })
        }}
      >
        <ChevronRightIcon />
      </button>

      <div className="hero-hud">
        <div className="container hero-hud-inner">
          <div className="hero-dots" role="tablist" aria-label="Choose slide">
            {slides.map((slide, slideIndex) => (
              <button
                key={slideIndex}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={`Go to slide ${slideIndex + 1}`}
                className={`hero-dot ${slideIndex === index ? 'is-active' : ''}`}
                onClick={() => {
                  goTo(slideIndex)
                  trackEvent('hero_slide_change', { direction: 'dot', slide: slideIndex + 1 })
                }}
              />
            ))}
          </div>
          <p className="hero-counter" aria-label={`Slide ${index + 1} of ${total}`}>
            <span className="hero-counter-current">{pad(index + 1)}</span>
            <span className="hero-counter-divider">/</span>
            <span className="hero-counter-total">{pad(total)}</span>
          </p>
        </div>
      </div>

      <div className="hero-progress" aria-hidden="true">
        <span key={`progress-${cycle}`} className="hero-progress-fill" />
      </div>
    </section>
  )
}
