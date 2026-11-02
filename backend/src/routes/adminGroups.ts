import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  listGroups, createGroup, updateGroup, setGroupStatus
} from '../controllers/admin/adminGroupsController'
import { requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

export const CLUB_CATEGORIES = ['Cultural', 'Academic', 'Arts', 'Religious', 'Sports', 'Political', 'Technology', 'Social']

const router = Router()

// Mounted inside routes/admin.ts, which already runs `authenticate`.
// Only administrators (not moderators) may manage groups.
router.use(requireRole(ROLES.ADMIN))

router.get('/', listGroups)

router.post('/',
  [
    body('kind').isIn(['CLUB', 'SOCIETY', 'TEAM']),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('The name must be 2 to 100 characters'),
    body('description').optional({ nullable: true }).isString().isLength({ max: 1000 }),
    body('category').optional({ nullable: true }).isIn(CLUB_CATEGORIES),
    body('sport').optional({ nullable: true }).trim().isLength({ min: 2, max: 40 }),
    body('season').optional({ nullable: true }).isString().isLength({ max: 20 }),
    body('leaderId').optional({ nullable: true }).isString()
  ],
  validate,
  createGroup
)

router.put('/:kind/:id',
  [
    param('kind').isIn(['club', 'team']),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('The name must be 2 to 100 characters'),
    body('description').optional({ nullable: true }).isString().isLength({ max: 1000 }),
    body('category').optional().isIn(CLUB_CATEGORIES),
    body('type').optional().isIn(['CLUB', 'SOCIETY']),
    body('sport').optional().trim().isLength({ min: 2, max: 40 }),
    body('season').optional({ nullable: true }).isString().isLength({ max: 20 })
  ],
  validate,
  updateGroup
)

router.put('/:kind/:id/status',
  [param('kind').isIn(['club', 'team']), body('status').isIn(['ACTIVE', 'INACTIVE'])],
  validate,
  setGroupStatus
)

export default router