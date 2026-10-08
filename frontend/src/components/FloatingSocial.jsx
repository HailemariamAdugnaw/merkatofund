import { FacebookIcon, TelegramIcon, TikTokIcon, InstagramIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics'

const ICONS = {
  facebook: FacebookIcon,
  telegram: TelegramIcon,
  tiktok: TikTokIcon,
  instagram: InstagramIcon
}

export default function FloatingSocial({ socials }) {
  const visible = socials.filter((social) => ICONS[social.platform])
  if (visible.length === 0) return null
  return (
    <nav className="floating-social" aria-label="Social media links">
      {visible.map((social) => {
        const Icon = ICONS[social.platform]
        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className={`floating-social-link floating-${social.platform}`}
            aria-label={social.label}
            onClick={() => trackEvent('social_click', { network: social.platform, location: 'floating' })}
          >
            <Icon />
            <span className="floating-social-label">{social.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
