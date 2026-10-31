import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { AuthRequest } from '../../middleware/auth'

const hideSecrets = { passwordHash: true, resetToken: true, resetTokenExpiry: true } as const

// GET /api/users/profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      omit: hideSecrets,
      include: {
        clubMemberships: {
          where: { status: 'ACTIVE' },
          include: {
            club: { select: { id: true, name: true, logoUrl: true, category: true } }
          }
        },
        managedClub: { select: { id: true, name: true } },
        managedTeam: { select: { id: true, name: true } }
      }
    })

    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    return res.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return res.status(500).json({ success: false, message: 'Error fetching profile' })
  }
}

// PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { faculty, yearOfStudy } = req.body
    const year = yearOfStudy ? parseInt(yearOfStudy) : undefined
    if (year !== undefined && (Number.isNaN(year) || year < 1 || year > 8)) {
      return res.status(400).json({ success: false, message: 'Year of study must be between 1 and 8' })
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { faculty, yearOfStudy: year },
      omit: hideSecrets
    })

    return res.json({ success: true, message: 'Profile updated successfully', data: user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return res.status(500).json({ success: false, message: 'Error updating profile' })
  }
}