import { describe, it, beforeEach, before } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { prisma } from '../src/config/prisma'
import { authenticate, optionalAuthenticate, clearUserCache, requireRole } from '../src/middleware/auth'
import { TOKEN_ISSUER, TOKEN_AUDIENCE } from '../src/utils/token'
import { fakeRes } from './helpers'

const SECRET = 'a-test-secret-that-is-long-enough-123456'
before(() => { process.env.API_JWT_SECRET = SECRET })

// The database is replaced by a function we control
let lookups = 0
let nextUser: Record<string, unknown> | null = null
;(prisma.user as any).findUnique = async () => { lookups++; return nextUser }

const token = (claims: Record<string, unknown> = {}) =>
  jwt.sign({ email: 'Student@Example.com', ...claims }, SECRET, { algorithm: 'HS256', issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE, expiresIn: '1h' })

const dbUser = (over: Record<string, unknown> = {}) => ({
  id: 'u1', email: 'student@example.com', role: 'STUDENT', studentId: 'S1', isActive: true,
  managedClubId: null, managedTeamId: null, passwordChangedAt: null, ...over
})

const call = async (fn: Function, authorization?: string) => {
  const req: any = { headers: authorization ? { authorization: `Bearer ${authorization}` } : {} }
  const res = fakeRes()
  let nexted = false
  await fn(req, res, () => { nexted = true })
  return { req, res, nexted }
}

beforeEach(() => { lookups = 0; nextUser = null; clearUserCache() })

describe('authenticate', () => {
  it('rejects a missing token with 401', async () => {
    const { res, nexted } = await call(authenticate)
    assert.equal(res.statusCode, 401)
    assert.equal(nexted, false)
  })
  it('loads the current user from the database', async () => {
    nextUser = dbUser()
    const { req, nexted } = await call(authenticate, token())
    assert.equal(nexted, true)
    assert.equal(req.user.role, 'STUDENT')
  })
  it('answers 403 for a suspended account', async () => {
    nextUser = dbUser({ isActive: false })
    assert.equal((await call(authenticate, token())).res.statusCode, 403)
  })
  it('ends a sign-in that began before the password was changed', async () => {
    const changed = new Date()
    nextUser = dbUser({ passwordChangedAt: changed })
    const { res, nexted } = await call(authenticate, token({ sid: Math.floor(changed.getTime() / 1000) - 3600 }))
    assert.equal(res.statusCode, 401)
    assert.equal(nexted, false)
  })
  it('allows a sign-in that began after the password was changed', async () => {
    nextUser = dbUser({ passwordChangedAt: new Date(Date.now() - 3600_000) })
    assert.equal((await call(authenticate, token({ sid: Math.floor(Date.now() / 1000) }))).nexted, true)
  })
  it('looks the user up once for repeated requests, until the cache is cleared', async () => {
    nextUser = dbUser()
    await call(authenticate, token())
    await call(authenticate, token())
    assert.equal(lookups, 1)
    clearUserCache()
    await call(authenticate, token())
    assert.equal(lookups, 2)
  })
})

describe('optionalAuthenticate', () => {
  it('lets a visitor with no token through, signed out', async () => {
    const { req, nexted } = await call(optionalAuthenticate)
    assert.equal(nexted, true)
    assert.equal(req.user, undefined)
  })
  it('keeps going as signed out when the account is suspended', async () => {
    nextUser = dbUser({ isActive: false })
    const { req, res, nexted } = await call(optionalAuthenticate, token())
    assert.equal(nexted, true)
    assert.equal(req.user, undefined)
    assert.equal(res.statusCode, 200)
  })
  it('identifies a signed-in person', async () => {
    nextUser = dbUser()
    assert.equal((await call(optionalAuthenticate, token())).req.user.id, 'u1')
  })
})

describe('requireRole', () => {
  it('blocks other roles with 403', () => {
    const res = fakeRes()
    let nexted = false
    requireRole('ADMIN')({ user: { role: 'STUDENT' } } as any, res as any, () => { nexted = true })
    assert.equal(res.statusCode, 403)
    assert.equal(nexted, false)
  })
})
