import { Router } from 'express'
import { body } from 'express-validator'
import { listReports, decideReport } from '../controllers/admin/reportsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.use(authenticate)
router.use(requireRole(ROLES.ADMIN, ROLES.MODERATOR))

router.get('/', listReports)
router.put('/:id',
  [
    body('action').isIn(['DISMISS', 'RESOLVE', 'WARN', 'SUSPEND']),
    body('note').optional({ nullable: true }).isString().isLength({ max: 500 }),
    body('removeContent').optional({ nullable: true }).isBoolean()
  ],
  validate,
  decideReport
)

export default router