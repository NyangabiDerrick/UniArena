import { Router } from 'express'
import { getProfile, updateProfile, syncUserFromSSO } from '../controllers/auth/userController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Sync user from SSO — called after login
router.post('/sync', syncUserFromSSO)

// Get own profile
router.get('/profile', authenticate, getProfile)

// Update own profile
router.put('/profile', authenticate, updateProfile)

export default router