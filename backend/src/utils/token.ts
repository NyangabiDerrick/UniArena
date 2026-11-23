import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Request } from 'express'

// The API token is signed by the frontend (NextAuth) and checked here.
// API_JWT_SECRET is separate from the NextAuth cookie secret; it falls back to NEXTAUTH_SECRET for older setups.
export const TOKEN_ISSUER = 'uniarena-web'
export const TOKEN_AUDIENCE = 'uniarena-api'

export const apiSecret = () => process.env.API_JWT_SECRET || process.env.NEXTAUTH_SECRET

export interface TokenPayload extends jwt.JwtPayload {
  email?: string
  role?: string
  // When the person's sign-in session began (seconds). Used to end sessions after a password reset.
  sid?: number
}

export const verifyApiToken = (token: string): TokenPayload | null => {
  const secret = apiSecret()
  if (!secret) return null
  try {
    return jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    }) as TokenPayload
  } catch {
    return null
  }
}

const sign = (value: string) => {
  const secret = apiSecret()
  return secret ? crypto.createHmac('sha256', secret).update(`client-ip:${value}`).digest('hex') : ''
}

export const signClientIp = sign

// NextAuth makes every sign-in call from its own server. It forwards the visitor's real address with
// a signature, so the API can count failed logins per visitor without trusting a header anyone could forge.
export const trustedClientIp = (req: Request): string | undefined => {
  const ip = req.headers['x-client-ip']
  const sig = req.headers['x-client-ip-sig']
  if (typeof ip !== 'string' || typeof sig !== 'string' || !ip || ip.length > 64) return undefined
  const expected = sign(ip)
  if (!expected || expected.length !== sig.length) return undefined
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)) ? ip : undefined
}
