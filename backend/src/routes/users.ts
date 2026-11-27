import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { getProfile, updateProfile, getDashboard, getLeaveReasons } from '../controllers/auth/userController'
import { exportMyData, deleteMyAccount } from '../controllers/auth/privacyController'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

const perUser = (max: number, message: string) => rateLimit({
  windowMs: 60 * 60 * 1000,
  max,
  keyGenerator: req => (req as AuthRequest).user?.id ?? 'anonymous',
  message: { success: false, message }
})

router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.get('/dashboard', authenticate, getDashboard)
router.get('/leave-reasons', authenticate, getLeaveReasons)
router.get('/me/export', authenticate, perUser(5, 'You have already downloaded your data several times. Please try again later.'), exportMyData)
router.delete('/me', authenticate, perUser(5, 'Too many attempts. Please try again later.'), deleteMyAccount)

export default router
