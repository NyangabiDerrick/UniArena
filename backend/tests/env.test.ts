import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { checkEnv } from '../src/config/env'

const good = {
  NODE_ENV: 'production', DATABASE_URL: 'postgresql://x', NEXTAUTH_SECRET: 'x'.repeat(40), API_JWT_SECRET: 'y'.repeat(40),
  FRONTEND_URL: 'https://app.example', ALLOWED_EMAIL_DOMAIN: 'mylife.mku.ac.ke', SUPABASE_URL: 'https://s.example',
  SUPABASE_SERVICE_KEY: 'k', BREVO_API_KEY: 'b', MAIL_FROM_EMAIL: 'no-reply@example.com', TRUST_PROXY_HOPS: '1'
} as unknown as NodeJS.ProcessEnv

describe('checkEnv', () => {
  it('passes a complete production setup', () => {
    assert.deepEqual(checkEnv(good), { errors: [], warnings: [] })
  })
  it('flags missing cloud storage and a short secret in production', () => {
    const r = checkEnv({ ...good, SUPABASE_URL: '', API_JWT_SECRET: 'short' })
    assert.match(r.errors.join(' '), /SUPABASE/)
    assert.match(r.errors.join(' '), /shorter than 32/)
  })
  it('warns when the proxy setting is missing', () => {
    assert.match(checkEnv({ ...good, TRUST_PROXY_HOPS: '0' }).warnings.join(' '), /TRUST_PROXY_HOPS/)
  })
  it('only requires the basics in development', () => {
    assert.deepEqual(checkEnv({ NODE_ENV: 'development', DATABASE_URL: 'x', NEXTAUTH_SECRET: 'x' } as unknown as NodeJS.ProcessEnv).errors, [])
  })
})
