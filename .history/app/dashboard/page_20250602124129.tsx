/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'


export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Nav />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Bienvenue, {user?.name} !
          </h1>
          <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Ajoutez ici vos widgets ou cartes de dashboard */}
              <div className="bg-indigo-50 dark:bg-indigo-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-900 dark:text-indigo-100">
                  Statistiques
                </h3>
                <p className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
                  Vos statistiques seront affichées ici
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                  Activités récentes
                </h3>
                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                  Vos activités récentes seront affichées ici
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 dark:text-purple-100">
                  Notifications
                </h3>
                <p className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                  Vos notifications seront affichées ici
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
