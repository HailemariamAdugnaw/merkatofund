import { useState } from 'react'
import { PlayIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics'

function toEmbedUrl(url) {
  if (!url) return ''
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`
  }
  return url
}

export default function VideoSection({ settings }) {
  const [playing, setPlaying] = useState(false)
  const videoUrl = (settings.video_url || '').trim()
  const embedUrl = toEmbedUrl(videoUrl)

  const handlePlay = () => {
    if (!embedUrl) return
    setPlaying(true)
    trackEvent('video_play', { video_url: videoUrl })
  }

  return (
    <section id="video" className="video-section">
      <div className="container video-inner">
        <div className="section-head reveal">
          <p className="kicker">Seeing Is Believing</p>
          <h2 className="section-title">Watch How It Works</h2>
          <p className="section-lede">
            A comprehensive explainer on how the fund operates, how your money is managed, and how
            the daily liquidity is distributed. The answer is just a click away.
          </p>
        </div>
        <div className="video-frame reveal">
          {playing && embedUrl ? (
            <iframe
              src={embedUrl}
              title="The Merkato Fund explainer video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              className={`video-thumb ${embedUrl ? 'has-video' : 'is-empty'}`}
              onClick={handlePlay}
              aria-label={embedUrl ? 'Play the explainer video' : 'The explainer video is coming soon'}
            >
              <img src="/images/video-thumbnail.png" alt="" className="video-poster" />
              {embedUrl ? (
                <>
                  <span className="play-button">
                    <PlayIcon />
                  </span>
                  <span className="video-caption">
                    Watch: how a 50 Birr daily contribution fuels a 5 Million Birr payout
                  </span>
                </>
              ) : (
                <span className="video-empty-note">
                  The explainer video is on its way. Follow our social channels to be the first to
                  watch it.
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
