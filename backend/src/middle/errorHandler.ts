import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err.message)

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