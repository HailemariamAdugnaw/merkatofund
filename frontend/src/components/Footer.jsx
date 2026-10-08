import { LogoMark, FacebookIcon, TelegramIcon, TikTokIcon, InstagramIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics'

const ICONS = {
  facebook: FacebookIcon,
  telegram: TelegramIcon,
  tiktok: TikTokIcon,
  instagram: InstagramIcon
}

export default function Footer({ articles, settings, socials }) {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#home" className="brand brand-footer">
            <LogoMark className="brand-mark" />
            <span className="brand-text">
              <span className="brand-name">{settings.site_name || 'The Merkato Fund'}</span>
              <span className="brand-tagline">{settings.tagline || 'Hybrid Financial Ecosystem'}</span>
            </span>
          </a>
          <p className="footer-about">{settings.footer_about}</p>
          <p className="footer-slogan">{settings.slogan || 'Not Equb. Not Lottery. Not Bank.'}</p>
        </div>
        <div className="footer-col">
          <p className="footer-heading">The Seven Articles</p>
          <ul className="footer-list">
            {articles.map((article) => (
              <li key={article.slug || article.order}>
                <a href={`#article-${article.order}`}>{article.title}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Reach Us</p>
          <ul className="footer-list">
            {settings.contact_phone ? (
              <li>
                <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`}>{settings.contact_phone}</a>
              </li>
            ) : null}
            {settings.contact_email ? (
              <li>
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </li>
            ) : null}
            {settings.contact_location ? <li><span>{settings.contact_location}</span></li> : null}
          </ul>
        </div>
        <div className="footer-col">
          <p className="footer-heading">Follow the Movement</p>
          <div className="footer-socials">
            {socials.map((social) => {
              const Icon = ICONS[social.platform]
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social"
                  aria-label={social.label}
                  onClick={() => trackEvent('social_click', { network: social.platform, location: 'footer' })}
                >
                  {Icon ? <Icon /> : null}
                  <span>{social.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} {settings.site_name || 'The Merkato Fund'} — 5 Million Birr
            Daily Liquidity for Everyday Ethiopia.
          </p>
          <p>{settings.footer_legal}</p>
        </div>
      </div>
    </footer>
  )
}
