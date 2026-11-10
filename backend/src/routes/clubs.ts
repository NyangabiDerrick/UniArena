import { Router } from 'express'
import { body } from 'express-validator'
import {
  getClubs, getClubById, getMyClub, getMembershipStatus, createClub,
  joinClub, getClubMembers, updateMembership, updateMyClub, CLUB_CATEGORIES
} from '../controllers/clubs/clubsController'
import { leaveGroup, getGroupInsights } from '../controllers/auth/userController'
import {
  listDiscussions, createPost, togglePin, deletePost
} from '../controllers/clubs/discussionsController'
import { authenticate, requireRole, requireGroupManager, ROLES } from '../middleware/auth'
import { verifiedOnly } from '../middleware/verified'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getClubs)
router.get('/mine', authenticate, requireRole(ROLES.CLUB_LEADER), getMyClub)
router.put('/mine',
  authenticate,
  requireRole(ROLES.CLUB_LEADER),
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('The name must be 2 to 100 characters'),
    body('description').optional({ nullable: true }).isString().isLength({ max: 1000 }),
    body('category').isIn(CLUB_CATEGORIES).withMessage('Choose a valid category'),
    body('type').isIn(['CLUB', 'SOCIETY'])
  ],
  validate,
  updateMyClub
)
router.get('/:id', getClubById)
router.get('/:id/membership', authenticate, getMembershipStatus)
router.get('/:id/insights', authenticate, requireGroupManager('club'), getGroupInsights)
router.post('/',
  authenticate,
  requireRole(ROLES.STUDENT, ROLES.ADMIN),
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('description').trim().notEmpty().isLength({ max: 1000 }),
    body('category').trim().notEmpty()
  ],
  validate,
  createClub
)
router.post('/:id/join', authenticate, requireRole(ROLES.STUDENT), joinClub)
router.post('/:id/leave', authenticate, requireRole(ROLES.STUDENT), leaveGroup)
router.get('/:id/members', authenticate, requireGroupManager('club'), getClubMembers)
router.put('/:id/members/:userId',
  authenticate,
  requireGroupManager('club'),
  [body('status').isIn(['ACTIVE', 'REJECTED', 'BANNED'])],
  validate,
  updateMembership
)

// Discussions: members, the club's leader and admins read; verified members post
router.get('/:id/discussions', authenticate, listDiscussions)
router.post('/:id/discussions',
  ...verifiedOnly,
  [
    body('title').trim().isLength({ min: 2, max: 120 }),
    body('content').trim().isLength({ min: 1, max: 2000 })
  ],
  validate,
  createPost
)
router.put('/:id/discussions/:postId/pin', authenticate, togglePin)
router.delete('/:id/discussions/:postId', authenticate, deletePost)

export default router