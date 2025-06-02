/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { z } from 'zod'
import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { sign } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import  Role from '@prisma/client'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  photo: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
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
      error: 'Invalid fields',
    }
  }

  const { email, password, name, photo } = validatedFields.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        error: 'User already exists',
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
      { userId: user.id, role: user.role },
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
    return {
      error: 'Something went wrong',
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
      error: 'Invalid fields',
    }
  }

  const { email, password } = validatedFields.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return {
        error: 'Invalid credentials',
      }
    }

    if (user.isBlocked) {
      return {
        error: 'Your account has been blocked',
      }
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return {
        error: 'Invalid credentials',
      }
    }

    const token = sign(
      { userId: user.id, role: user.role },
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
    return {
      error: 'Something went wrong',
    }
  }
}
