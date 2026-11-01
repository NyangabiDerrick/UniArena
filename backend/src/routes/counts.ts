import { Router } from 'express'
import { getCounts } from '../controllers/auth/countsController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getCounts)

export default router