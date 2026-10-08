const SOCIAL_FIELDS = [
  { key: 'facebook_url', platform: 'facebook', label: 'Facebook' },
  { key: 'telegram_url', platform: 'telegram', label: 'Telegram' },
  { key: 'tiktok_url', platform: 'tiktok', label: 'TikTok' },
  { key: 'instagram_url', platform: 'instagram', label: 'Instagram' }
]

export function getSocials(settings) {
  return SOCIAL_FIELDS.map(({ key, platform, label }) => ({
    platform,
    label,
    url: (settings[key] || '').trim()
  })).filter((social) => social.url.length > 0)
}
