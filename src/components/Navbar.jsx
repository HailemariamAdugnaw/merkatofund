import { useEffect, useState } from 'react'
import { MenuIcon, CloseIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics'

export default function Navbar({ articles, activeSection }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
    trackEvent('nav_click', { target: id })
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
