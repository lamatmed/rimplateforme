/* eslint-disable react/no-unescaped-entities */
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const team = [
  {
    name: 'Jean Dupont',
    role: 'Fondateur & CEO',
    image: '/team/jean.jpg',
  },
  {
    name: 'Marie Martin',
    role: 'Directrice Technique',
    image: '/team/marie.jpg',
  },
  {
    name: 'Pierre Durand',
    role: 'Lead Designer',
    image: '/team/pierre.jpg',
  },
];

export default function AboutPage() {
  return (
    <div className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl"
          >
            À propos de RimPlateforme
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-gray-600 dark:text-gray-400"
          >
            Votre partenaire de confiance pour l&apos;innovation digitale
          </motion.p>
        </div>

        {/* Mission Section */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-64 lg:h-full"
            >
              <Image
                src="/about/mission.jpg"
                alt="Notre mission"
                fill
                className="object-cover rounded-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col justify-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Notre Mission
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Chez RimPlateforme, nous nous engageons à transformer vos idées en solutions digitales innovantes. Notre mission est d'accompagner les entreprises dans leur transformation numérique en leur offrant des services de qualité et des solutions sur mesure.
              </p>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Nous croyons en l'importance de créer des expériences utilisateur exceptionnelles tout en maintenant les plus hauts standards de qualité et de performance.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Notre Équipe
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Nos Valeurs
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Innovation
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Nous repoussons constamment les limites pour créer des solutions innovantes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Qualité
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Nous nous engageons à fournir des services de la plus haute qualité.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Collaboration
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Nous travaillons en étroite collaboration avec nos clients pour atteindre leurs objectifs.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 