import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { errorHandler, notFound } from './middleware/errorHandler'
import { generalLimiter } from './middleware/rateLimiter'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import clubRoutes from './routes/clubs'
import sportRoutes from './routes/sports'
import eventRoutes from './routes/events'
import articleRoutes from './routes/articles'
import adminRoutes from './routes/admin'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security headers
app.use(helmet())

// Only our own frontend may call this API from a browser
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean)

    // No origin = server-to-server call (NextAuth) or curl
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(generalLimiter)
app.use(morgan('dev'))
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

// All route groups. Each line makes one group of URLs available.
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/sports', sportRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/admin', adminRoutes)

// These two MUST stay last. Anything registered after them is never reached.
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 UniArena backend running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

export default app