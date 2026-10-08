import { useState } from 'react'
import { api } from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { MailIcon, PhoneIcon, PinIcon, CheckIcon } from './Icons.jsx'

const EMPTY_FORM = { name: '', email: '', phone: '', message: '' }

export default function ContactSection({ settings, socials }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    setErrorMessage('')
    try {
      await api.submitContact(form)
      setStatus('success')
      trackEvent('contact_submit', { status: 'success' })
      setForm(EMPTY_FORM)
    } catch {
      setStatus('error')
      setErrorMessage(
        'Your message could not be sent right now. Please try again, or reach us instantly on our social channels.'
      )
      trackEvent('contact_submit', { status: 'error' })
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="container contact-grid">
        <div className="contact-intro reveal">
          <p className="kicker">Our Digital Doors Are Always Open</p>
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-lede">
            Join the conversation, ask questions, and stay updated on the latest batches. Send us a
            message and our team will respond promptly.
          </p>
          <ul className="contact-details">
            {settings.contact_phone ? (
              <li>
                <PhoneIcon />
                <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`}>{settings.contact_phone}</a>
              </li>
            ) : null}
            {settings.contact_email ? (
              <li>
                <MailIcon />
                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
              </li>
            ) : null}
            {settings.contact_location ? (
              <li>
                <PinIcon />
                <span>{settings.contact_location}</span>
              </li>
            ) : null}
          </ul>
          {socials.length > 0 ? (
            <div className="contact-socials">
              <span className="contact-socials-label">Instant support on</span>
              <div className="social-row">
                {socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="social-chip"
                    aria-label={social.label}
                    onClick={() => trackEvent('social_click', { network: social.platform, location: 'contact' })}
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <form className="contact-form reveal" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label className="form-field">
              <span className="form-label">Full name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={updateField('name')}
                placeholder="Your name"
                required
              />
            </label>
            <label className="form-field">
              <span className="form-label">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField('email')}
                placeholder="you@example.com"
                required
              />
            </label>
          </div>
          <label className="form-field">
            <span className="form-label">Phone (optional)</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={updateField('phone')}
              placeholder="+251 ..."
            />
          </label>
          <label className="form-field">
            <span className="form-label">Message</span>
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={updateField('message')}
              placeholder="Ask us anything about the fund..."
              required
            />
          </label>
          {status === 'success' ? (
            <p className="form-banner form-success">
              <CheckIcon /> Thank you — your message has been received. Our team will get back to you
              shortly.
            </p>
          ) : null}
          {status === 'error' ? <p className="form-banner form-error">{errorMessage}</p> : null}
          <button type="submit" className="btn btn-gold btn-lg form-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  )
}
