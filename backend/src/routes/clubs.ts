import { Router } from 'express'
import { body } from 'express-validator'
import {
  getClubs, getClubById, createClub,
  joinClub, getClubMembers, updateMembership
} from '../controllers/clubs/clubsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getClubs)
router.get('/:id', getClubById)
router.post('/',
  authenticate,
  requireRole(ROLES.STUDENT, ROLES.ADMIN),
  [
    body('name').trim().notEmpty().withMessage('Club name is required').isLength({ max: 100 }),
    body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
    body('category').trim().notEmpty().withMessage('Category is required')
  ],
  validate,
  createClub
)
router.post('/:id/join', authenticate, requireRole(ROLES.STUDENT), joinClub)
router.get('/:id/members', authenticate, getClubMembers)
router.put('/:id/members/:userId', authenticate, requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN), updateMembership)

export default router