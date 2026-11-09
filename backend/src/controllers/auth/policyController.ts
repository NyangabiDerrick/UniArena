import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'
import { CURRENT_ACCEPTANCE, POLICY_VERSION, TERMS_VERSION } from '../../legal/policy'

// GET /api/auth/policy-status: does the signed-in user need to accept the current version?
export const policyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { policyVersion: true }
    })
    const accepted = user?.policyVersion === CURRENT_ACCEPTANCE
    return sendSuccess(res, { accepted, policyVersion: POLICY_VERSION, termsVersion: TERMS_VERSION })
  } catch (error) {
    return sendError(res, 'Could not check policy status', 500, error)
  }
}

// POST /api/auth/accept-policy
export const acceptPolicy = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { policyVersion: CURRENT_ACCEPTANCE, policyAcceptedAt: new Date() }
    })
    return sendSuccess(res, null, 'Thank you. You can continue using UniArena.')
  } catch (error) {
    return sendError(res, 'Could not record your acceptance', 500, error)
  }
}