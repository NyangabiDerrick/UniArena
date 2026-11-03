import { Router } from 'express'
import { param } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { setImage, removeImage } from '../controllers/admin/groupImagesController'
import { authenticate, requireGroupManager, AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { receiveImage } from '../utils/imageUpload'

const router = Router()

const kind = param('kind').isIn(['logo', 'banner'])

// 20 uploads an hour per signed-in person
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: req => (req as AuthRequest).user?.id ?? 'anonymous',
  message: { success: false, message: 'You have uploaded several images already. Please try again later.' }
})

// Leaders can change only their own group (checked by requireGroupManager). Admins can change any.
router.post('/clubs/:id/:kind', authenticate, requireGroupManager('club'), [kind], validate, uploadLimiter, receiveImage, setImage('club'))
router.delete('/clubs/:id/:kind', authenticate, requireGroupManager('club'), [kind], validate, removeImage('club'))
router.post('/teams/:id/:kind', authenticate, requireGroupManager('team'), [kind], validate, uploadLimiter, receiveImage, setImage('team'))
router.delete('/teams/:id/:kind', authenticate, requireGroupManager('team'), [kind], validate, removeImage('team'))

export default router