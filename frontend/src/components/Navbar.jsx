import { useEffect, useRef, useState } from 'react'
import { MenuIcon, CloseIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics'

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.46 11.46 0 0 0-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className="nav-dropdown-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function resolveTarget(storeUrl, file) {
  const store = (storeUrl || '').trim()
  if (store) {
    return { href: store, external: true }
  }
  const asset = (file || '').trim()
  if (asset) {
    return { href: asset, external: false }
  }
  return null
}

export default function Navbar({ articles, activeSection, appDownload }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const dropdownRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('nav-open', open)
    return () => document.body.classList.remove('nav-open')
  }, [open])

  useEffect(() => {
    if (!downloadOpen) return
    const onOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDownloadOpen(false)
      }
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setDownloadOpen(false)
      }
    }
    document.addEventListener('click', onOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [downloadOpen])

  const links = [
    { href: '#home', label: 'Home', id: 'home' },
    ...articles.map((article) => ({
      href: `#article-${article.order}`,
      label: article.nav_label || article.title,
      id: `article-${article.order}`
    })),
    { href: '#video', label: 'Video', id: 'video' },
    { href: '#contact', label: 'Contact', id: 'contact' }
  ]

  const handleNavigate = (id) => {
    setOpen(false)
    setDownloadOpen(false)
    trackEvent('nav_click', { target: id })
  }

  const downloadEnabled = appDownload && appDownload.is_active !== false
  const downloadItems = downloadEnabled
    ? [
        {
          key: 'arm64',
          label: appDownload.arm64_label || 'Modern Phones (arm64)',
          target: resolveTarget(appDownload.arm64_store_url, appDownload.arm64_file)
        },
        {
          key: 'legacy',
          label: appDownload.legacy_label || 'Older Devices (Legacy 32-bit)',
          target: resolveTarget(appDownload.legacy_store_url, appDownload.legacy_file)
        }
      ]
    : []

  const toggleDownload = () => {
    if (!downloadOpen) {
      trackEvent('nav_click', { target: 'download-app' })
      if (window.matchMedia('(max-width: 1199px)').matches) {
        setTimeout(() => {
          panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 80)
      }
    }
    setDownloadOpen(!downloadOpen)
  }

  const handleDownload = (key, target) => {
    setDownloadOpen(false)
    setOpen(false)
    trackEvent('app_download_click', {
      variant: key,
      method: target.external ? 'store' : 'file'
    })
  }

  const renderItem = (item) => {
    if (!item.target) {
      return (
        <span className="nav-dropdown-item is-disabled" aria-disabled="true" key={item.key}>
          <AndroidIcon />
          <span className="nav-dropdown-item-copy">
            <strong>{item.label}</strong>
            <small>Coming soon</small>
          </span>
        </span>
      )
    }
    return (
      <a
        key={item.key}
        className="nav-dropdown-item"
        href={item.target.href}
        onClick={() => handleDownload(item.key, item.target)}
        {...(item.target.external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : { download: true })}
      >
        <AndroidIcon />
        <span className="nav-dropdown-item-copy">
          <strong>{item.label}</strong>
          <small>{item.target.external ? 'Open the store page' : 'Direct APK download'}</small>
        </span>
        <DownloadIcon />
      </a>
    )
  }

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <a href="#home" className="brand" onClick={() => handleNavigate('home')}>
          <img src="/logo.jpg" alt="The Merkato Fund logo" className="brand-mark" />
          <span className="brand-text">
            <span className="brand-name">The Merkato Fund</span>
            <span className="brand-tagline">5 Million Birr Daily</span>
          </span>
        </a>
        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Primary navigation">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`nav-link ${activeSection === link.id ? 'is-active' : ''}`}
              onClick={() => handleNavigate(link.id)}
            >
              {link.label}
            </a>
          ))}
          {downloadEnabled ? (
            <div className={`nav-dropdown ${downloadOpen ? 'is-open' : ''}`} ref={dropdownRef}>
              <button
                type="button"
                className="nav-dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={downloadOpen}
                onClick={toggleDownload}
              >
                <DownloadIcon />
                <span>{appDownload.menu_label || 'Download App'}</span>
                <ChevronIcon />
              </button>
              <div className="nav-dropdown-panel" role="menu" aria-label="App download options" ref={panelRef}>
                <p className="nav-dropdown-title">
                  Get the Merkato Fund app
                  {appDownload.badge ? <em className="nav-dropdown-badge">{appDownload.badge}</em> : null}
                </p>
                {downloadItems.map(renderItem)}
                {appDownload.note ? <p className="nav-dropdown-note">{appDownload.note}</p> : null}
              </div>
            </div>
          ) : null}
          <a href="#article-7" className="btn btn-gold nav-cta" onClick={() => handleNavigate('join-cta')}>
            Join the Movement
          </a>
        </nav>
        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  )
}
