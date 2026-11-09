import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { StorageClient } from '@supabase/storage-js'

// Local disk is used in development. With the Supabase settings present, files go to Supabase Storage.
export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'))

let client: StorageClient | null = null

const remote = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  if (!client) {
    client = new StorageClient(`${url.replace(/\/+$/, '')}/storage/v1`, {
      apikey: key,
      Authorization: `Bearer ${key}`
    })
  }
  return client
}

const bucket = () => process.env.SUPABASE_BUCKET || 'uniarena-media'

// Stored values are either "/uploads/folder/file" (local) or a full https address (Supabase)
export const saveImage = async (folder: 'clubs' | 'teams', name: string, data: Buffer): Promise<string> => {
  const file = `${name}-${crypto.randomBytes(4).toString('hex')}.webp`
  const sb = remote()

  if (sb) {
    const key = `${folder}/${file}`
    const { error } = await sb.from(bucket()).upload(key, data, { contentType: 'image/webp', upsert: false })
    if (error) throw new Error(`Image upload failed: ${error.message}`)
    return sb.from(bucket()).getPublicUrl(key).data.publicUrl
  }

  const dir = path.join(UPLOAD_ROOT, folder)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, file), data)
  return `/uploads/${folder}/${file}`
}

export const deleteImage = async (url?: string | null): Promise<void> => {
  if (!url) return

  if (url.startsWith('http')) {
    const sb = remote()
    const marker = `/object/public/${bucket()}/`
    const at = url.indexOf(marker)
    if (!sb || at === -1) return
    await sb.from(bucket()).remove([url.slice(at + marker.length)]).catch(() => {})
    return
  }

  if (!url.startsWith('/uploads/')) return
  const target = path.resolve(UPLOAD_ROOT, url.slice('/uploads/'.length))
  if (!target.startsWith(UPLOAD_ROOT + path.sep)) return
  await fs.unlink(target).catch(() => {})
}