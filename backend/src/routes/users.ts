import { Router } from 'express'
import { getProfile, updateProfile, getDashboard, getLeaveReasons } from '../controllers/auth/userController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.get('/dashboard', authenticate, getDashboard)
router.get('/leave-reasons', authenticate, getLeaveReasons)

export default router