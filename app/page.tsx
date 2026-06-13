'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { subscribeToAllTrips } from '@/lib/firestore'
import { USERS, type Trip } from '@/types'

export default function Home() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToAllTrips(t => {
      setTrips(t)
      setLoading(false)
    })
    return unsub
  }, [])

  function tripStatus(trip: Trip) {
    const now = new Date()
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    if (now < start) return 'upcoming'
    if (now > end) return 'past'
    return 'in progress'
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 pt-4"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-800">🧳 PackMate</h1>
          <p className="text-slate-500 text-sm mt-0.5">Family packing, organized</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/trips/new')}
          className="bg-violet-600 text-white font-bold text-sm px-4 py-2.5 rounded-2xl shadow-lg hover:bg-violet-700 transition-colors"
        >
          + New Trip
        </motion.button>
      </motion.div>

      {/* Trip list */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-4xl mb-3 animate-bounce">✈️</div>
          <p>Loading trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No trips yet</h2>
          <p className="text-slate-500 mb-6">Create your first trip to get started.</p>
          <button
            onClick={() => router.push('/trips/new')}
            className="bg-violet-600 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:bg-violet-700 transition-colors"
          >
            + Create a Trip
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip, i) => {
            const status = tripStatus(trip)
            const members = USERS.filter(u => trip.members.includes(u.id))
            return (
              <motion.button
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/trips/${trip.id}`)}
                className="w-full bg-white rounded-3xl shadow-md p-5 text-left hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{trip.destination}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </p>
                  </div>
                  <span className={`
                    text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap
                    ${status === 'in progress' ? 'bg-green-100 text-green-700' :
                      status === 'upcoming'    ? 'bg-violet-100 text-violet-700' :
                                                 'bg-slate-100 text-slate-500'}
                  `}>
                    {status}
                  </span>
                </div>

                {/* Member chips */}
                <div className="flex gap-2 flex-wrap">
                  {members.map(u => (
                    <span
                      key={u.id}
                      className={`text-xs font-bold px-3 py-1 rounded-full text-white ${u.color}`}
                    >
                      {u.name}
                    </span>
                  ))}
                </div>

                {/* Activities */}
                {trip.activities.length > 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    {trip.activities.join(' · ')}
                  </p>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </main>
  )
}
