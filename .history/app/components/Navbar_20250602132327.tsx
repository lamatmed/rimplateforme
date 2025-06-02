/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/actions';
import { Role } from '@/lib/generated/prisma';

// Événement personnalisé pour les changements d'authentification
const AUTH_CHANGE_EVENT = 'authChange';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fonction pour récupérer l'utilisateur
  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Récupérer l'utilisateur initial
    fetchUser();

    // Écouter les événements de changement d'authentification
    const handleAuthChange = () => fetchUser();
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Déclencher l'événement pour mettre à jour tous les composants
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
      setShowLogoutConfirm(false);
      setIsMenuOpen(false); // Fermer le menu mobile
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'Administrateur';
      case Role.USER:
        return 'Utilisateur';
      default:
        return role;
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white dark:bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="relative w-12 h-12 mr-3 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md transition-transform duration-300 hover:scale-105">
                <Image
                  src="/logo.svg"
                  alt="RimPlateforme Logo"
                  width={100}
                  height={40}
                  className="h-8 w-auto"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                RimPlateforme
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
              Accueil
            </Link>
            <Link href="/services" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
              Services
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
              Contact
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.photo ? (
                    <Image
                      src={user.photo}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-indigo-500 transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      <span className="text-sm">
                        {user.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300 block">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Déconnexion
                  </button>
                  
                  {/* Confirmation de déconnexion */}
                  {showLogoutConfirm && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-200 mb-3">
                        Êtes-vous sûr de vouloir vous déconnecter ?
                      </p>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowLogoutConfirm(false)}
                          className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                        >
                          Confirmer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Connexion
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out max-w-xs w-full h-full">
            <div className="px-5 pt-5 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative w-10 h-10 mr-3 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow">
                    <Image
                      src="/logo.svg"
                      alt="RimPlateforme Logo"
                      width={80}
                      height={32}
                      className="h-6 w-auto"
                    />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    RimPlateforme
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-8 space-y-1">
                <Link href="/" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Accueil
                </Link>
                <Link href="/services" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Services
                </Link>
                <Link href="/about" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  À propos
                </Link>
                <Link href="/contact" className="block px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </Link>
              </div>
            </div>

            {/* User section in mobile menu */}
            <div className="pt-4 pb-8 border-t border-gray-200 dark:border-gray-700 px-5">
              {loading ? (
                <div className="animate-pulse flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ) : user ? (
                <>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {user.photo ? (
                        <Image
                          src={user.photo}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-indigo-500"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          <span className="text-base">
                            {user.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {getRoleLabel(user.role)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <Link
                      href="/dashboard"
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-base shadow-md transition-all duration-300 hover:shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tableau de bord
                    </Link>
                    
                    {showLogoutConfirm ? (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300 mb-3 text-center">
                          Déconnexion ?
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md font-medium"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium"
                          >
                            Oui
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="block w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium text-base shadow-md transition-all duration-300 hover:shadow-lg"
                      >
                        Déconnexion
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-center text-base shadow-md transition-all duration-300 hover:shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}