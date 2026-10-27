import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/auth/userController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)

export default router