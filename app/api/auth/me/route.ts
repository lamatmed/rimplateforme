import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Non authentifié' }),
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        photo: true,
      },
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Auth error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Erreur d\'authentification' }),
      { status: 401 }
    )
  }
} 