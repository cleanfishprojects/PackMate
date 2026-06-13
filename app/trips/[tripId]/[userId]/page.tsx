'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { subscribeToTrip } from '@/lib/firestore'
import { USERS, type Trip, type UserId } from '@/types'
import MasterBuilder from '@/components/admin/MasterBuilder'
import AffirmationBanner from '@/components/admin/AffirmationBanner'
import DayOfReminders from '@/components/admin/DayOfReminders'
import KidPackingView from '@/components/child/KidPackingView'

export default function PackingPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string
  const userId = params.userId as UserId

  const [trip, setTrip] = useState<Trip | null>(null)
  const user = USERS.find(u => u.id === userId)

  useEffect(() => {
    const unsub = subscribeToTrip(tripId, setTrip)
    return unsub
  }, [tripId])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Unknown user.
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-3 animate-bounce">📦</div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // ── Kid view ──────────────────────────────────────────────────────────────
  if (user.role === 'child') {
    const list = lists[0] ?? null
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4 pt-4"
          >
            <button
              onClick={() => router.push(`/trips/${tripId}`)}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">{user.name}'s Packing</h1>
              <p className="text-sm text-slate-500">{trip.destination}</p>
            </div>
          </motion.div>

          <KidPackingView userId={userId} userName={user.name} tripId={tripId} />
        </div>
      </main>
    )
  }

  // ── Admin view ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 pt-4"
        >
          <button
            onClick={() => router.push(`/trips/${tripId}`)}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">{trip.destination} · Admin</h1>
            <p className="text-sm text-slate-500">Manage packing lists</p>
          </div>
        </motion.div>

        {user.receiveAffirmations && (
          <div className="mb-6">
            <AffirmationBanner />
          </div>
        )}

        <div className="space-y-6">
          <MasterBuilder tripId={tripId} />
          <DayOfReminders />
        </div>
      </div>
    </main>
  )
}
