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

// A small file can unpack into a huge picture and use a lot of memory. 24 million pixels is a 6000 x 4000 photo.
const MAX_INPUT_PIXELS = 24_000_000

// The file's own first bytes must say JPEG, PNG or WebP. The type the browser declares is not trusted.
export const looksLikeImage = (data: Buffer) =>
  (data.length > 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) ||
  (data.length > 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
  (data.length > 12 && data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP')

const SIZES = {
  logo: { width: 256, height: 256 },
  banner: { width: 1200, height: 400 }
} as const

// Fixes rotation, crops to size, converts to WebP. Metadata (including location) is dropped.
export const processImage = (data: Buffer, kind: 'logo' | 'banner') =>
  sharp(data, { limitInputPixels: MAX_INPUT_PIXELS }).rotate().resize({ ...SIZES[kind], fit: 'cover' }).webp({ quality: 82 }).toBuffer()