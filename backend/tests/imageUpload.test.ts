import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { looksLikeImage } from '../src/utils/imageUpload'

describe('looksLikeImage', () => {
  it('accepts JPEG, PNG and WebP signatures', () => {
    assert.equal(looksLikeImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0])), true)
    assert.equal(looksLikeImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])), true)
    assert.equal(looksLikeImage(Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP'), Buffer.from([0])])), true)
  })
  it('rejects scripts, text and empty files that claim to be images', () => {
    assert.equal(looksLikeImage(Buffer.from('<script>alert(1)</script>')), false)
    assert.equal(looksLikeImage(Buffer.from('GIF89a......')), false)
    assert.equal(looksLikeImage(Buffer.alloc(0)), false)
  })
})
