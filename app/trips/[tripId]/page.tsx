'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { subscribeToTrip } from '@/lib/firestore'
import { USERS, type Trip } from '@/types'

const USER_COLORS: Record<string, { bg: string; text: string }> = {
  ben:     { bg: 'bg-blue-500',   text: 'text-white' },
  jessica: { bg: 'bg-purple-500', text: 'text-white' },
  luke:    { bg: 'bg-green-500',  text: 'text-white' },
  thomas:  { bg: 'bg-orange-500', text: 'text-white' },
}

export default function TripDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string
  const [trip, setTrip] = useState<Trip | null>(null)

  useEffect(() => {
    const unsub = subscribeToTrip(tripId, setTrip)
    return unsub
  }, [tripId])

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-3 animate-bounce">✈️</div>
          <p>Loading trip...</p>
        </div>
      </div>
    )
  }

  const members = USERS.filter(u => trip.members.includes(u.id))

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  const nights = Math.round(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <main className="min-h-screen bg-slate-50 p-6 max-w-lg mx-auto">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6 pt-4"
      >
        <button
          onClick={() => router.push('/')}
          className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">{trip.destination}</h1>
          <p className="text-sm text-slate-500">
            {formatDate(trip.startDate)} · {nights} night{nights !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Weather pill */}
      {trip.weatherForecast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 mb-6 text-sm text-sky-700 font-medium"
        >
          🌤️ {trip.weatherForecast.temp}°F · {trip.weatherForecast.description}
        </motion.div>
      )}

      {/* Who's packing — colorful name cards */}
      <div className="mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Who's packing?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {members.map((user, i) => {
            const colors = USER_COLORS[user.id] ?? { bg: 'bg-slate-500', text: 'text-white' }
            return (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 220 }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(`/trips/${tripId}/${user.id}`)}
                className={`
                  ${colors.bg} ${colors.text}
                  rounded-3xl p-6 text-left shadow-lg hover:shadow-xl transition-shadow
                  relative overflow-hidden
                `}
              >
                {user.role === 'admin' && (
                  <span className="absolute top-3 right-3 text-xs font-bold bg-white/25 rounded-full px-2 py-0.5">
                    Admin
                  </span>
                )}
                <p className="text-2xl font-black tracking-tight">{user.name}</p>
                {user.role === 'child' && (
                  <p className="text-sm opacity-75 mt-1">
                    Age {user.id === 'luke' ? '10' : '7'}
                  </p>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Activities */}
      {trip.activities.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Activities
          </h2>
          <div className="flex flex-wrap gap-2">
            {trip.activities.map(a => (
              <span key={a} className="bg-white border border-slate-200 text-slate-600 text-sm font-semibold px-3 py-1.5 rounded-full capitalize">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
