import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../../middleware/auth'

const prisma = new PrismaClient()

// GET /api/users/profile — get own profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.user?.email },
      include: {
        clubMemberships: {
          where: { status: 'ACTIVE' },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                category: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    return res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    })
  }
}

// PUT /api/users/profile — update own profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { faculty, yearOfStudy, avatarUrl } = req.body

    const user = await prisma.user.update({
      where: { email: req.user?.email },
      data: {
        faculty,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
        avatarUrl,
        updatedAt: new Date()
      }
    })

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return res.status(500).json({
      success: false,
      message: 'Error updating profile'
    })
  }
}

// POST /api/users/sync — sync user from SSO on login
export const syncUserFromSSO = async (req: Request, res: Response) => {
  try {
    const { email, name, studentId, faculty, yearOfStudy, role } = req.body

    if (!email || !name || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Email, name and studentId are required'
      })
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        faculty,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
        updatedAt: new Date()
      },
      create: {
        email,
        name,
        studentId,
        faculty,
        yearOfStudy: yearOfStudy ? parseInt(yearOfStudy) : undefined,
        role: role || 'STUDENT',
        isActive: true
      }
    })

    return res.json({
      success: true,
      message: 'User synced successfully',
      data: user
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return res.status(500).json({
      success: false,
      message: 'Error syncing user'
    })
  }
}