/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sign } from 'jsonwebtoken'
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
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        error: 'Email ou mot de passe incorrect',
      }
    }

    if (user.isBlocked) {
      return {
        error: 'Votre compte a été bloqué',
      }
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return {
        error: 'Email ou mot de passe incorrect',
      }
    }

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
    console.error('Login error:', error)
    return {
      error: 'Une erreur est survenue lors de la connexion',
    }
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
