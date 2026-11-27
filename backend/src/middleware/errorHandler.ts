import { Request, Response, NextFunction } from 'express'

interface HttpError extends Error {
  status?: number
  statusCode?: number
  type?: string
}

// Ordinary client mistakes (bad JSON, too large, blocked origin) get their real 4xx status.
// Only genuine server faults are logged as errors and reported as 500.
export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err)

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'This origin is not allowed' })
  }

  const status = err.status || err.statusCode || 500

  if (status >= 400 && status < 500) {
    const message =
      err.type === 'entity.too.large' ? 'The request is too large'
      : err.type === 'entity.parse.failed' ? 'The request body is not valid JSON'
      : 'Bad request'
    return res.status(status).json({ success: false, message })
  }

  console.error(JSON.stringify({ level: 'error', requestId: (req as Request & { id?: string }).id, message: err.message, stack: err.stack }))

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
}

export const notFound = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
}
