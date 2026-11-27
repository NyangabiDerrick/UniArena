// Environment variables are read when an email is sent, because dotenv loads after imports run.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function sendOnce(to: string, subject: string, html: string, text: string, key: string): Promise<'ok' | 'retry' | 'stop'> {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: process.env.MAIL_FROM_NAME || 'UniArena', email: process.env.MAIL_FROM_EMAIL },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      })
    })
    if (!res.ok) {
      console.error('Email failed:', res.status, await res.text())
      return res.status >= 500 || res.status === 429 ? 'retry' : 'stop'
    }
    return 'ok'
  } catch (error) {
    console.error('Email failed:', error)
    return 'retry'
  }
}

// Tries up to three times with a growing pause, because email providers have short outages.
// A rejected request (4xx) is not retried: sending it again would not change the answer.
async function sendMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const key = process.env.BREVO_API_KEY

  // No key configured: print the email so development still works
  if (!key) {
    console.log(`\n[DEV mail] To: ${to}\nSubject: ${subject}\n${text}\n`)
    return true
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await sendOnce(to, subject, html, text, key)
    if (result === 'ok') return true
    if (result === 'stop') return false
    if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 800))
  }
  return false
}

const wrap = (title: string, body: string, link: string, button: string) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1A1916">
  <h2 style="color:#0B1D3A;margin:0 0 16px">${title}</h2>
  <p style="line-height:1.6;margin:0 0 20px">${body}</p>
  <p style="margin:0 0 24px"><a href="${link}" style="background:#0B1D3A;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;display:inline-block">${button}</a></p>
  <p style="font-size:12px;color:#6B6962;line-height:1.5;margin:0">If the button doesn't work, copy this address into your browser:<br>${link}</p>
</div>`

export const sendVerificationEmail = (to: string, name: string, link: string) =>
  sendMail(
    to,
    'Confirm your UniArena email',
    wrap('Confirm your email', `Hi ${esc(name)}, confirm that this is your university email to unlock messaging, RSVPs and joining clubs. The link works for 24 hours.`, link, 'Confirm my email'),
    `Hi ${name}, confirm your UniArena email (valid for 24 hours): ${link}`
  )

export const sendResetEmail = (to: string, name: string, link: string) =>
  sendMail(
    to,
    'Reset your UniArena password',
    wrap('Reset your password', `Hi ${esc(name)}, use the button below to choose a new password. The link works for one hour. If you didn't ask for this, ignore this email and your password stays the same.`, link, 'Choose a new password'),
    `Hi ${name}, reset your UniArena password (valid for 1 hour): ${link}. If you didn't ask for this, ignore this email.`
  )

export const sendExistingAccountEmail = (to: string, name: string, link: string) =>
  sendMail(
    to,
    'You already have a UniArena account',
    wrap('You already have an account', `Hi ${esc(name)}, someone tried to create a UniArena account with this email address or registration number, but you already have one. If it was you, just sign in. If you forgot your password, you can reset it from the sign-in page. If it was not you, you can ignore this email.`, link, 'Go to sign in'),
    `Hi ${name}, someone tried to create a UniArena account with your details, but you already have one. Sign in here: ${link}. If you forgot your password, use "Forgot password" on that page.`
  )
