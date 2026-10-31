import { Router } from 'express'
import { body } from 'express-validator'
import { getArticles, getArticleById, createArticle } from '../controllers/news/articlesController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getArticles)
router.get('/:id', getArticleById)
router.post('/',
  authenticate,
  requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN),
  [body('title').trim().notEmpty().isLength({ max: 200 }), body('content').trim().notEmpty()],
  validate,
  createArticle
)

export default router