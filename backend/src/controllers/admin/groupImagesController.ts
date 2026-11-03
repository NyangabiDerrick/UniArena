import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'
import { saveImage, deleteImage } from '../../utils/storage'
import { processImage } from '../../utils/imageUpload'

type Target = 'club' | 'team'
type Kind = 'logo' | 'banner'

const load = (target: Target, id: string) =>
  target === 'club'
    ? prisma.club.findUnique({ where: { id }, select: { name: true, logoUrl: true, bannerUrl: true } })
    : prisma.sportsTeam.findUnique({ where: { id }, select: { name: true, logoUrl: true, bannerUrl: true } })

const store = (target: Target, id: string, kind: Kind, url: string | null) => {
  const data = kind === 'logo' ? { logoUrl: url } : { bannerUrl: url }
  return target === 'club'
    ? prisma.club.update({ where: { id }, data })
    : prisma.sportsTeam.update({ where: { id }, data })
}

const noun = (kind: Kind) => (kind === 'logo' ? 'Logo' : 'Banner')

// POST /api/groups/(clubs|teams)/:id/(logo|banner)  multipart field "image"
export const setImage = (target: Target) => async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id
    const kind = req.params.kind as Kind

    if (!req.file) return sendError(res, 'Choose a JPEG, PNG or WebP image up to 5 MB', 400)

    const group = await load(target, id)
    if (!group) return sendError(res, 'Group not found', 404)

    let processed: Buffer
    try {
      processed = await processImage(req.file.buffer, kind)
    } catch {
      return sendError(res, "That file isn't a valid image", 400)
    }

    const url = await saveImage(target === 'club' ? 'clubs' : 'teams', `${id}-${kind}`, processed)
    await store(target, id, kind, url)
    await deleteImage(kind === 'logo' ? group.logoUrl : group.bannerUrl)

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: `${noun(kind)} changed`,
        targetType: target === 'club' ? 'Club' : 'SportsTeam',
        targetId: id,
        details: group.name
      }
    })

    return sendSuccess(res, { url }, `${noun(kind)} updated`)
  } catch (error) {
    return sendError(res, 'Failed to save the image', 500, error)
  }
}

// DELETE /api/groups/(clubs|teams)/:id/(logo|banner)
export const removeImage = (target: Target) => async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id
    const kind = req.params.kind as Kind

    const group = await load(target, id)
    if (!group) return sendError(res, 'Group not found', 404)

    await store(target, id, kind, null)
    await deleteImage(kind === 'logo' ? group.logoUrl : group.bannerUrl)

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: `${noun(kind)} removed`,
        targetType: target === 'club' ? 'Club' : 'SportsTeam',
        targetId: id,
        details: group.name
      }
    })

    return sendSuccess(res, null, `${noun(kind)} removed`)
  } catch (error) {
    return sendError(res, 'Failed to remove the image', 500, error)
  }
}