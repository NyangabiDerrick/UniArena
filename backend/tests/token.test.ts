import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { verifyApiToken, signClientIp, trustedClientIp, TOKEN_ISSUER, TOKEN_AUDIENCE } from '../src/utils/token'

const SECRET = 'a-test-secret-that-is-long-enough-123456'
before(() => { process.env.API_JWT_SECRET = SECRET })

const make = (opts: jwt.SignOptions = {}, secret = SECRET) =>
  jwt.sign({ email: 'a@b.c' }, secret, { algorithm: 'HS256', issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE, expiresIn: '1h', ...opts })

describe('verifyApiToken', () => {
  it('accepts a correct token', () => {
    assert.equal(verifyApiToken(make())?.email, 'a@b.c')
  })
  it('rejects the wrong secret, issuer, audience, or an expired token', () => {
    assert.equal(verifyApiToken(make({}, 'another-secret-another-secret-123456')), null)
    assert.equal(verifyApiToken(make({ issuer: 'someone-else' })), null)
    assert.equal(verifyApiToken(make({ audience: 'someone-else' })), null)
    assert.equal(verifyApiToken(make({ expiresIn: -10 })), null)
  })
  it('rejects tokens that use the none algorithm or another HMAC size', () => {
    const none = Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url') + '.' + Buffer.from('{"email":"a@b.c"}').toString('base64url') + '.'
    assert.equal(verifyApiToken(none), null)
    assert.equal(verifyApiToken(make({ algorithm: 'HS512' })), null)
  })
})

describe('trustedClientIp', () => {
  const req = (headers: Record<string, string>) => ({ headers }) as any
  it('trusts an address that carries a valid signature', () => {
    assert.equal(trustedClientIp(req({ 'x-client-ip': '41.90.1.2', 'x-client-ip-sig': signClientIp('41.90.1.2') })), '41.90.1.2')
  })
  it('ignores an address with a missing or forged signature', () => {
    assert.equal(trustedClientIp(req({ 'x-client-ip': '41.90.1.2' })), undefined)
    assert.equal(trustedClientIp(req({ 'x-client-ip': '41.90.1.2', 'x-client-ip-sig': signClientIp('9.9.9.9') })), undefined)
    assert.equal(trustedClientIp(req({ 'x-client-ip': '41.90.1.2', 'x-client-ip-sig': 'abc' })), undefined)
  })
})
