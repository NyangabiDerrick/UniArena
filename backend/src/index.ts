import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { errorHandler, notFound } from './middleware/errorHandler'
import { checkEnv } from './config/env'
import { prisma } from './config/prisma'
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

const report = checkEnv()
report.warnings.forEach(w => console.warn(`[config] ${w}`))
if (report.errors.length) {
  report.errors.forEach(e => console.error(`[config] ${e}`))
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to start with an unsafe or incomplete configuration.')
    process.exit(1)
  }
}

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
      ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000']),
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

// Every request gets an id, so one failure can be followed through the logs
app.use((req, res, next) => {
  const id = String(req.headers['x-request-id'] || '').slice(0, 64) || crypto.randomUUID()
  ;(req as express.Request & { id?: string }).id = id
  res.setHeader('X-Request-Id', id)
  next()
})
morgan.token('id', req => (req as express.Request & { id?: string }).id || '-')
app.use(process.env.NODE_ENV === 'production'
  ? morgan((tokens, req, res) => JSON.stringify({
      level: 'info', id: tokens.id(req, res), method: tokens.method(req, res),
      path: tokens.url(req, res)?.split('?')[0], status: Number(tokens.status(req, res)),
      ms: Number(tokens['response-time'](req, res)), ip: req.socket.remoteAddress
    }), { skip: req => req.url === '/health' || req.url === '/health/ready' })
  : morgan('dev'))

app.use(generalLimiter)
app.use(identifyForLimits)
app.use(userLimiter)
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))
app.use(cookieParser())

// Public lists and pages can be kept for a short time by browsers and the CDN.
// Anything for a signed-in person (an Authorization header) is never stored by a shared cache.
const PUBLIC_READS = /^\/api\/(clubs|sports|events|articles)(\/(?!mine|categories|managed|tickets)[^/]+)?$/
app.use((req, res, next) => {
  if (req.method === 'GET' && PUBLIC_READS.test(req.path)) {
    res.setHeader('Vary', 'Authorization')
    res.setHeader('Cache-Control', req.headers.authorization ? 'private, no-store' : 'public, max-age=30, stale-while-revalidate=120')
  }
  next()
})

// Is the process up? Used for simple uptime checks. Reveals nothing about the setup.
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'UniArena API is running' })
})

// Can it actually serve people? Checks the database. Point the host's health check here.
app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ success: true, message: 'Ready' })
  } catch {
    res.status(503).json({ success: false, message: 'Database unavailable' })
  }
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

const server = app.listen(PORT, () => {
  console.log(`🚀 UniArena backend running on http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`)
})

// Deploys and restarts: stop taking new requests, let current ones finish, then close the database
let stopping = false
const shutdown = (signal: string) => {
  if (stopping) return
  stopping = true
  console.log(`${signal} received: shutting down`)
  const force = setTimeout(() => process.exit(1), 10_000)
  force.unref()
  server.close(async () => {
    await prisma.$disconnect().catch(() => {})
    process.exit(0)
  })
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', reason => console.error(JSON.stringify({ level: 'error', message: 'Unhandled rejection', reason: String(reason) })))
process.on('uncaughtException', error => {
  console.error(JSON.stringify({ level: 'error', message: 'Uncaught exception', error: error.message, stack: error.stack }))
  shutdown('uncaughtException')
})

export default app