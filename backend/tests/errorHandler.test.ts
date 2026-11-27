import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { errorHandler } from '../src/middleware/errorHandler'
import { fakeRes } from './helpers'

const run = (err: Error & Record<string, unknown>) => {
  const res = fakeRes()
  const original = console.error
  console.error = () => {}
  try { errorHandler(err as any, {} as any, res, () => {}) } finally { console.error = original }
  return res
}

describe('errorHandler', () => {
  it('answers an oversized body with 413, not 500', () => {
    const res = run(Object.assign(new Error('too big'), { status: 413, type: 'entity.too.large' }))
    assert.equal(res.statusCode, 413)
    assert.equal(res.body.message, 'The request is too large')
  })
  it('answers malformed JSON with 400', () => {
    assert.equal(run(Object.assign(new Error('bad'), { status: 400, type: 'entity.parse.failed' })).statusCode, 400)
  })
  it('answers a blocked origin with 403', () => {
    assert.equal(run(new Error('Not allowed by CORS')).statusCode, 403)
  })
  it('keeps real faults as 500 and hides the details', () => {
    const res = run(new Error('database exploded'))
    assert.equal(res.statusCode, 500)
    assert.equal(res.body.message, 'Internal server error')
    assert.ok(!JSON.stringify(res.body).includes('database exploded'))
  })
})
