import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'
import { sendVerificationEmail, sendResetEmail } from '../../utils/mailer'
import { CURRENT_ACCEPTANCE } from '../../legal/policy'

const DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || 'university.ac').toLowerCase()
const hashToken = (t: string) => crypto.createHash('sha256').update(t).digest('hex')
const frontend = () => process.env.FRONTEND_URL || 'http://localhost:3000'

const issueVerification = async (user: { id: string; email: string; name: string }) => {
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken: hashToken(token), verifyTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) }
  })
  return sendVerificationEmail(user.email, user.name, `${frontend()}/auth/verify-email?token=${token}`)
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, studentId, password, faculty, acceptedPolicy } = req.body
    const cleanEmail = String(email).trim().toLowerCase()

    if (acceptedPolicy !== true) {
      return sendError(res, 'You must read and accept the Terms and Data Policy to create an account', 400)
    }

    if (!cleanEmail.endsWith(`@${DOMAIN}`)) {
      return sendError(res, `Only @${DOMAIN} email addresses can register`, 403)
    }

    const regNo = String(studentId).trim().toUpperCase()
    const expectedLocalPart = regNo.replace(/[^A-Z0-9]/g, '').toLowerCase()

    if (cleanEmail.split('@')[0] !== expectedLocalPart) {
      return sendError(res, "Your registration number doesn't match your university email", 400)
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { studentId: regNo }] }
    })
    if (existing) return sendError(res, 'An account with this email or registration number already exists', 409)

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: cleanEmail,
        studentId: regNo,
        faculty: faculty || null,
        role: 'STUDENT',
        passwordHash: await bcrypt.hash(password, 12),
        policyVersion: CURRENT_ACCEPTANCE,
        policyAcceptedAt: new Date()
      },
      select: { id: true, email: true, name: true }
    })

    await issueVerification(user).catch(error => console.error('Verification email failed:', error))

    return sendSuccess(res, user, 'Account created. Check your university inbox to confirm your email.', 201)
  } catch (error) {
    return sendError(res, 'Failed to create account', 500, error)
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } })

    const valid = user?.passwordHash && (await bcrypt.compare(password, user.passwordHash))
    if (!user || !valid) return sendError(res, 'Invalid email or password', 401)
    if (!user.isActive) return sendError(res, 'This account has been suspended', 403)

    return sendSuccess(res, {
      id: user.id, email: user.email, name: user.name,
      role: user.role, studentId: user.studentId, faculty: user.faculty
    }, 'Signed in')
  } catch (error) {
    return sendError(res, 'Failed to sign in', 500, error)
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: String(req.body.email).trim().toLowerCase() } })

    if (user && user.isActive) {
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashToken(token), resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) }
      })
      await sendResetEmail(user.email, user.name, `${frontend()}/auth/reset-password?token=${token}`)
    }

    return sendSuccess(res, null, 'If that email has an account, a reset link has been sent.')
  } catch (error) {
    return sendError(res, 'Failed to process request', 500, error)
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body
    const user = await prisma.user.findFirst({
      where: { resetToken: hashToken(String(token)), resetTokenExpiry: { gt: new Date() } }
    })
    if (!user) return sendError(res, 'This reset link is invalid or has expired', 400)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        resetToken: null,
        resetTokenExpiry: null,
        emailVerified: true
      }
    })
    return sendSuccess(res, null, 'Password updated. You can now sign in.')
  } catch (error) {
    return sendError(res, 'Failed to reset password', 500, error)
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: { verifyToken: hashToken(String(req.body.token)), verifyTokenExpiry: { gt: new Date() } }
    })
    if (!user) {
      return sendError(res, 'This confirmation link is invalid or has expired. If you already confirmed, just sign in.', 400)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verifyToken: null, verifyTokenExpiry: null }
    })
    return sendSuccess(res, null, 'Your email is confirmed.')
  } catch (error) {
    return sendError(res, 'Failed to confirm your email', 500, error)
  }
}

export const resendVerification = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, emailVerified: true }
    })
    if (!user) return sendError(res, 'Account not found', 404)
    if (user.emailVerified) return sendSuccess(res, null, 'Your email is already confirmed.')

    const sent = await issueVerification(user)
    if (!sent) return sendError(res, "We couldn't send the email right now. Please try again in a few minutes.", 502)
    return sendSuccess(res, null, `Confirmation link sent to ${user.email}.`)
  } catch (error) {
    return sendError(res, 'Failed to send the email', 500, error)
  }
}