import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { errorHandler, notFound } from './middleware/errorHandler'
import { generalLimiter } from './middleware/rateLimiter'
import userRoutes from './routes/users'
import userRoutes from './routes/users'
import clubRoutes from './routes/clubs'
import sportRoutes from './routes/sports'
import eventRoutes from './routes/events'
import articleRoutes from './routes/articles'
import adminRoutes from './routes/admin'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
app.use(generalLimiter)

// Logging
app.use(morgan('dev'))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'UniArena API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// Routes
app.use('/api/users', userRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/sports', sportRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/admin', adminRoutes)

// Test protected route
app.get('/api/test/student', 
  (req, res, next) => {
    const { authenticate } = require('./middleware/auth')
    authenticate(req, res, next)
  },
  (req, res, next) => {
    const { requireRole, ROLES } = require('./middleware/auth')
    requireRole(ROLES.STUDENT, ROLES.ADMIN)(req, res, next)
  },
  (req, res) => {
    res.json({ 
      success: true, 
      message: 'Student route works',
    })
  }
)

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UniArena backend running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

export default app