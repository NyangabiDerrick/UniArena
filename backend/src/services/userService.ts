import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SSOUserData {
  email: string
  name: string
  studentId: string
  faculty?: string
  yearOfStudy?: number
  role?: string
}

// Create or update user from SSO data
export const upsertUserFromSSO = async (data: SSOUserData) => {
  try {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        faculty: data.faculty,
        yearOfStudy: data.yearOfStudy,
        updatedAt: new Date()
      },
      create: {
        email: data.email,
        name: data.name,
        studentId: data.studentId,
        faculty: data.faculty,
        yearOfStudy: data.yearOfStudy,
        role: (data.role as any) || 'STUDENT',
        isActive: true
      }
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error upserting user:', error)
    return { success: false, error }
  }
}

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return { success: true, user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error }
  }
}

// Get user by ID
export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        clubMemberships: {
          include: { club: true }
        }
      }
    })
    return { success: true, user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error }
  }
}

// Deactivate user
export const deactivateUser = async (id: string) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })
    return { success: true, user }
  } catch (error) {
    console.error('Error deactivating user:', error)
    return { success: false, error }
  }
}