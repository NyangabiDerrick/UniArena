import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

// Local disk for now. To move to cloud storage later, replace these two functions.
export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'))

export const saveImage = async (folder: 'clubs' | 'teams', name: string, data: Buffer): Promise<string> => {
  const file = `${name}-${crypto.randomBytes(4).toString('hex')}.webp`
  const dir = path.join(UPLOAD_ROOT, folder)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, file), data)
  return `/uploads/${folder}/${file}`
}

export const deleteImage = async (url?: string | null): Promise<void> => {
  if (!url || !url.startsWith('/uploads/')) return
  const target = path.resolve(UPLOAD_ROOT, url.slice('/uploads/'.length))
  if (!target.startsWith(UPLOAD_ROOT + path.sep)) return
  await fs.unlink(target).catch(() => {})
}
