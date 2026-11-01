import { Router } from 'express'
import { body } from 'express-validator'
import { listAppeals, decideAppeal } from '../controllers/admin/adminAppealsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.use(authenticate)
router.use(requireRole(ROLES.ADMIN))

router.get('/', listAppeals)
router.put('/:id',
  [
    body('action').isIn(['APPROVE', 'REJECT']),
    body('note').optional({ nullable: true }).isString().isLength({ max: 500 })
  ],
  validate,
  decideAppeal
)

export default router