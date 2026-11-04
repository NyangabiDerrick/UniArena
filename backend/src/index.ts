import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { errorHandler, notFound } from './middleware/errorHandler'
import { generalLimiter, identifyForLimits, userLimiter } from './middleware/rateLimiter'
import { verifiedOnly } from './middleware/verified'
import { UPLOAD_ROOT } from './utils/storage'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import clubRoutes from './routes/clubs'
import sportRoutes from './routes/sports'
import eventRoutes from './routes/events'
import articleRoutes from './routes/articles'
import adminRoutes from './routes/admin'
import notificationRoutes from './routes/notifications'
import messageRoutes from './routes/messages'
import adminReportRoutes from './routes/adminReports'
import adminAppealRoutes from './routes/adminAppeals'
import groupImageRoutes from './routes/groupImages'
import appealRoutes from './routes/appeals'
import commentRoutes from './routes/comments'
import countsRoutes from './routes/counts'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Behind a hosting proxy (Railway, Vercel, nginx) set TRUST_PROXY_HOPS=1 so each
// person's real IP is used. Leave it unset on your own computer.
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0)
if (proxyHops > 0) app.set('trust proxy', proxyHops)

// Security headers
app.use(helmet())

// Uploaded logos and banners are shown on the frontend's own origin, so allow cross-site image loading
app.use('/uploads', (_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static(UPLOAD_ROOT, { maxAge: '7d', index: false, dotfiles: 'deny' }))

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
app.use(identifyForLimits)
app.use(userLimiter)
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

// Students must confirm their email before these three actions
app.post('/api/messages', ...verifiedOnly)
app.post('/api/events/:id/tickets', ...verifiedOnly)
app.post('/api/clubs/:id/join', ...verifiedOnly)

// All route groups. Specific /api/admin/... paths go before the general /api/admin.
app.use('/api/auth', authRoutes)
app.use('/api/appeals', appealRoutes)
app.use('/api/users', userRoutes)
app.use('/api/clubs', clubRoutes)
app.use('/api/sports', sportRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/counts', countsRoutes)
app.use('/api/groups', groupImageRoutes)
app.use('/api/admin/reports', adminReportRoutes)
app.use('/api/admin/appeals', adminAppealRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', commentRoutes)

// These two MUST stay last. Anything registered after them is never reached.
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 UniArena backend running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

export default app