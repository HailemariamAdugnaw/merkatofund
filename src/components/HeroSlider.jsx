import { useCallback, useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics'

const AUTOPLAY_MS = 6500

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback(
    (next) => {
      if (slides.length === 0) return
      setIndex(((next % slides.length) + slides.length) % slides.length)
    },
    [slides.length]
  )

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, slides.length])

  return (
    <section
      id="home"
      className="hero"
      aria-roledescription="carousel"
      aria-label="The Merkato Fund highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-backdrop" aria-hidden="true">
        <span className="hero-glow hero-glow-one" />
        <span className="hero-glow hero-glow-two" />
      </div>
      <div className="container">
        <div className="hero-viewport">
          <div className="hero-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {slides.map((slide, slideIndex) => (
              <article
                className={`hero-slide ${slideIndex === index ? 'is-active' : ''}`}
                key={`${slide.heading || 'slide'}-${slideIndex}`}
                aria-hidden={slideIndex !== index}
              >
                <div className="hero-copy">
                  <p className="hero-eyebrow">{slide.eyebrow}</p>
                  <h1 className="hero-title">
                    {slide.heading} <span className="hero-accent">{slide.accent}</span>
                  </h1>
                  <p className="hero-body">{slide.body}</p>
                  <div className="hero-actions">
                    <a
                      className="btn btn-gold btn-lg"
                      href={slide.cta1_href || '#article-7'}
                      onClick={() => trackEvent('hero_cta', { target: slide.cta1_href || '#article-7' })}
                    >
                      {slide.cta1_label || 'Join the Movement'}
                    </a>
                    <a
                      className="btn btn-outline btn-lg"
                      href={slide.cta2_href || '#video'}
                      onClick={() => trackEvent('hero_cta', { target: slide.cta2_href || '#video' })}
                    >
                      {slide.cta2_label || 'Watch the Video'}
                    </a>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="hero-stage">
                    <figure className="hero-photo">
                      <div className="hero-photo-frame">
                        <img
                          src={slide.image || `/images/image${slideIndex + 1}.jpg`}
                          alt={`${slide.heading || 'The Merkato Fund'} ${slide.accent || ''}`.trim()}
                          loading={slideIndex === 0 ? 'eager' : 'lazy'}
                        />
                      </div>
                    </figure>
                    <div className="stat-chip">
                      <p className="stat-chip-value">{slide.stat_value || '5M'}</p>
                      <span className="stat-chip-divider" aria-hidden="true" />
                      <p className="stat-chip-label">{slide.stat_label || 'Birr Daily Liquidity'}</p>
                    </div>
                  </div>
                  <div className="hero-flow-lines" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="hero-controls">
          <button
            type="button"
            className="hero-arrow"
            aria-label="Previous slide"
            onClick={() => {
              goTo(index - 1)
              trackEvent('hero_slide_change', { direction: 'prev' })
            }}
          >
            <ChevronLeftIcon />
          </button>
          <div className="hero-dots" role="tablist" aria-label="Choose slide">
            {slides.map((slide, slideIndex) => (
              <button
                key={slideIndex}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={`Go to slide ${slideIndex + 1}`}
                className={`hero-dot ${slideIndex === index ? 'is-active' : ''}`}
                onClick={() => goTo(slideIndex)}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero-arrow"
            aria-label="Next slide"
            onClick={() => {
              goTo(index + 1)
              trackEvent('hero_slide_change', { direction: 'next' })
            }}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
