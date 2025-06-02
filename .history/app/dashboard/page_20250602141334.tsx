/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Role } from '@prisma/client'
import { getUsers, toggleUserBlock } from '@/lib/actions'

// Correction du type CreatedAt
interface User {
  id: string
  name: string
  email: string
  role: Role
  photo: string | null
  isBlocked: boolean
  createdAt: Date // Changé de string à Date
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)

  // Ajout de l'écouteur d'événements d'authentification
  useEffect(() => {
    const handleAuthChange = () => {
      fetchUser()
    }

    window.addEventListener('authChange', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/?message=Vous devez être connecté pour accéder au tableau de bord')
          return
        }
        const data = await response.json()
        setUser(data)
        
        // Si l'utilisateur est admin, charger la liste des utilisateurs
        if (data.role === Role.ADMIN) {
          fetchUsers()
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push('/?message=Une erreur est survenue, veuillez vous reconnecter')
      } finally {
        setLoading(false)
      }
    }

    const fetchUsers = async () => {
      setUsersLoading(true)
      try {
        const { users } = await getUsers()
        setUsers(users)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setUsersLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const { user: updatedUser } = await toggleUserBlock(userId, !currentStatus)
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isBlocked: !currentStatus } : u
      ))
      
      // Si l'utilisateur bloqué est l'utilisateur actuel, déconnecter
      if (user?.id === userId && !currentStatus) {
        window.dispatchEvent(new CustomEvent('authChange'))
        router.push('/login')
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'Administrateur'
      case Role.USER:
        return 'Utilisateur'
      default:
        return role
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête du tableau de bord */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            {user?.photo ? (
              <Image
                src={user.photo}
                alt={user.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                <span className="text-2xl font-bold">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bienvenue, {user?.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Total Utilisateurs
            </h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {users.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Utilisateurs Bloqués
            </h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {users.filter(u => u.isBlocked).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Administrateurs
            </h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {users.filter(u => u.role === Role.ADMIN).length}
            </p>
          </div>
        </div>

        {/* Liste des utilisateurs (Admin uniquement) */}
        {user?.role === Role.ADMIN && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 transition-all duration-300 hover:shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Gestion des Utilisateurs
            </h2>
            {usersLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.photo ? (
                              <Image
                                src={user.photo}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="rounded-full border-2 border-indigo-500"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                <span className="text-sm">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isBlocked
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {user.isBlocked ? 'Bloqué' : 'Actif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                            className={`px-3 py-1 rounded-md font-medium ${
                              user.isBlocked
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            } transition-colors duration-300`}
                          >
                            {user.isBlocked ? 'Débloquer' : 'Bloquer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Contenu principal */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Vue d'ensemble
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Bienvenue sur votre tableau de bord. Ici, vous pouvez gérer vos activités,
              consulter vos messages et suivre vos tâches en cours.
            </p>
            {user?.role === Role.ADMIN && (
              <p className="text-gray-600 dark:text-gray-300">
                En tant qu'administrateur, vous avez accès à la gestion complète des utilisateurs.
                Vous pouvez voir le nombre total d'utilisateurs, les bloquer ou les débloquer selon vos besoins.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function fetchUser() {
    throw new Error('Function not implemented.')
}
