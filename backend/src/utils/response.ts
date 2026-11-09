import { Response } from 'express'

export const sendSuccess = (res: Response, data: any, message = 'Success', status = 200) => {
  return res.status(status).json({ success: true, message, data })
}

export const sendError = (res: Response, message: string, status = 500, error?: any) => {
  // Server errors are logged so the real cause is visible in the terminal
  if (status >= 500 && error) {
    console.error(`[${status}] ${message}:`, error)
  }
  return res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  })
}