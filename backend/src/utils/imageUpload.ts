import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { sendError } from './response'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
})

// Reads one file from the "image" field. Upload problems become clear 400 answers.
export const receiveImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      return sendError(res, err.code === 'LIMIT_FILE_SIZE' ? 'The image must be 5 MB or smaller' : 'Upload failed', 400)
    }
    if (err) return sendError(res, 'Upload failed', 400)
    next()
  })
}

const SIZES = {
  logo: { width: 256, height: 256 },
  banner: { width: 1200, height: 400 }
} as const

// Fixes rotation, crops to size, converts to WebP. Metadata (including location) is dropped.
export const processImage = (data: Buffer, kind: 'logo' | 'banner') =>
  sharp(data).rotate().resize({ ...SIZES[kind], fit: 'cover' }).webp({ quality: 82 }).toBuffer()