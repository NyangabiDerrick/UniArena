import { Router } from 'express'
import { getArticles, getArticleById, createArticle } from '../controllers/news/articlesController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'

const router = Router()

router.get('/', getArticles)
router.get('/:id', getArticleById)
router.post('/', authenticate, requireRole(ROLES.CLUB_LEADER, ROLES.SPORTS_CAPTAIN, ROLES.ADMIN), createArticle)

export default router