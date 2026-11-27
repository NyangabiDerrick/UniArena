// Checks the settings the API needs before it starts accepting requests.
// In production a missing or unsafe setting stops the server. In development it only prints a warning.

export interface EnvReport {
  errors: string[]
  warnings: string[]
}

export const checkEnv = (env: NodeJS.ProcessEnv = process.env): EnvReport => {
  const errors: string[] = []
  const warnings: string[] = []
  const prod = env.NODE_ENV === 'production'

  if (!env.DATABASE_URL) errors.push('DATABASE_URL is not set')
  if (!env.NEXTAUTH_SECRET && !env.API_JWT_SECRET) errors.push('NEXTAUTH_SECRET (or API_JWT_SECRET) is not set')

  if (prod) {
    if (!env.FRONTEND_URL) errors.push('FRONTEND_URL is not set (CORS and email links need it)')
    if (!env.ALLOWED_EMAIL_DOMAIN) errors.push('ALLOWED_EMAIL_DOMAIN is not set')
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      errors.push('SUPABASE_URL and SUPABASE_SERVICE_KEY are not set: uploaded images would be lost on every deploy')
    }
    if (!env.BREVO_API_KEY || !env.MAIL_FROM_EMAIL) errors.push('BREVO_API_KEY and MAIL_FROM_EMAIL are not set: no confirmation emails would be sent')
    if (Number(env.TRUST_PROXY_HOPS || 0) < 1) {
      warnings.push('TRUST_PROXY_HOPS is 0: behind a hosting proxy every visitor shares one rate limit. Set it to 1 on Railway.')
    }
    if (!env.API_JWT_SECRET) warnings.push('API_JWT_SECRET is not set: the API token shares the NextAuth secret. Set a separate value on both sides.')
    const secret = env.API_JWT_SECRET || env.NEXTAUTH_SECRET || ''
    if (secret && secret.length < 32) errors.push('The token secret is shorter than 32 characters')
  }

  return { errors, warnings }
}
