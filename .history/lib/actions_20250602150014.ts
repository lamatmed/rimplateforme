/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sign, verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { Role } from '@prisma/client'


const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  photo: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export async function register(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
    photo: formData.get('photo'),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { email, password, name, photo } = validatedFields.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        error: 'Un compte existe déjà avec cet email',
      }
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        photo,
        role: Role.USER,
        isBlocked: false,
      },
    })

    const token = sign(
      { 
        userId: user.id,
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    ;(await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo: user.photo,
      },
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      error: 'Une erreur est survenue l\'inscription',
    }
  }
}

export async function login(formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        error: 'Ce compte n\'existe pas',
      };
    }

    if (user.isBlocked) {
      return {
        error: 'Votre compte a été bloqué',
      };
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return {
        error: 'Mot de passe incorrect',
      };
    }

    const token = sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    (await cookies()).set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photo: user.photo,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      error: 'Une erreur est survenue lors de la connexion',
    };
  }
}

export async function signOut() {
  try {
    ;(await cookies()).delete('token')
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: 'Une erreur est survenue lors de la déconnexion' }
  }
}

export async function getUsers() {
  try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      throw new Error('Non authentifié')
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user) {
      throw new Error('Accès non autorisé')
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo: true,
        isBlocked: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { users }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function toggleUserBlock(userId: string, isBlocked: boolean) {
  try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      throw new Error('Non authentifié')
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error('Accès non autorisé')
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true
      }
    })

    return { user: updatedUser }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function getUserStats() {
  try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      throw new Error('Non authentifié')
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    })

    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    const stats = await prisma.user.aggregate({
      _count: {
        _all: true,
        isBlocked: true,
        role: true
      },
      where: {
        role: Role.ADMIN
      }
    })

    return {
      totalUsers: stats._count._all,
      blockedUsers: stats._count.isBlocked,
      adminUsers: stats._count.role
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    throw error
  }
}
