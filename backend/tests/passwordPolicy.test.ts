import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { passwordProblem, MIN_PASSWORD_LENGTH } from '../src/utils/passwordPolicy'

describe('passwordProblem', () => {
  it('rejects short passwords', () => {
    assert.match(passwordProblem('abc123')!, new RegExp(String(MIN_PASSWORD_LENGTH)))
  })
  it('rejects common passwords', () => {
    assert.match(passwordProblem('password123')!, /common/i)
    assert.match(passwordProblem('Password123')!, /common/i)
  })
  it('rejects repeated characters and simple sequences', () => {
    assert.match(passwordProblem('aaaaaaaaaaaa')!, /repeated/i)
    assert.match(passwordProblem('1234567890abc')!, /sequence/i)
  })
  it('rejects passwords that contain the registration number', () => {
    assert.match(passwordProblem('xbscs202539761x', 'bscs202539761@mylife.mku.ac.ke')!, /registration number/i)
  })
  it('accepts a long, unusual password', () => {
    assert.equal(passwordProblem('violet-harbour-lantern-42'), null)
  })
})
