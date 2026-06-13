'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { USERS, type UserId } from '@/types'
import AffirmationBanner from '@/components/admin/AffirmationBanner'
import TripCreator from '@/components/admin/TripCreator'
import MasterBuilder from '@/components/admin/MasterBuilder'
import DayOfReminders from '@/components/admin/DayOfReminders'
import KidPackingView from '@/components/child/KidPackingView'

export default function UserPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()

  const user = USERS.find(u => u.id === userId)
  const [activeTripId, setActiveTripId] = useState<string | null>(null)
  const [showTripCreator, setShowTripCreator] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <div className="text-5xl mb-4">🤔</div>
          <h1 className="text-2xl font-bold text-slate-700">Profile not found</h1>
          <button onClick={() => router.push('/')} className="mt-4 text-violet-600 font-semibold">
            ← Back to profiles
          </button>
        </div>
      </div>
    )
  }

  // ── Child view ──────────────────────────────────────────────────────────────
  if (user.role === 'child') {
    if (!activeTripId) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-violet-50 to-indigo-50">
          <div className="text-7xl mb-4">{user.emoji}</div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Hi, {user.name}! 👋</h1>
          <p className="text-slate-500 mb-8">Enter a trip ID to see your packing list.</p>
          <TripIdEntry onSubmit={setActiveTripId} />
          <button
            onClick={() => router.push('/')}
            className="mt-6 text-slate-400 text-sm font-medium hover:text-slate-600"
          >
            ← Switch profile
          </button>
        </div>
      )
    }
    return (
      <KidPackingView
        userId={user.id as UserId}
        userName={user.name}
        tripId={activeTripId}
      />
    )
  }

  // ── Admin view ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-4">
          <span className="text-3xl">{user.emoji}</span>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-800">{user.name}'s Dashboard</h1>
            <p className="text-slate-400 text-xs">PackMate Admin</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-slate-400 hover:text-slate-600 font-medium"
          >
            ← Switch
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6 space-y-6">
        {/* Affirmation engine (Ben only) */}
        {user.receiveAffirmations && <AffirmationBanner />}

        {/* Trip creation / management toggle */}
        {!activeTripId ? (
          <>
            {!showTripCreator ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🧳</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Ready to plan a trip?</h2>
                <p className="text-slate-400 mb-6">Create a trip to generate packing lists for the family.</p>
                <button
                  onClick={() => setShowTripCreator(true)}
                  className="bg-violet-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-violet-700 transition-all hover:shadow-xl active:scale-[0.98] text-base"
                >
                  ✈️ Plan a New Trip
                </button>
                <div className="mt-6">
                  <p className="text-slate-400 text-sm mb-2">Already have a trip?</p>
                  <TripIdEntry onSubmit={setActiveTripId} />
                </div>
              </motion.div>
            ) : (
              <div>
                <button
                  onClick={() => setShowTripCreator(false)}
                  className="text-slate-400 text-sm mb-4 hover:text-slate-600 font-medium"
                >
                  ← Back
                </button>
                <TripCreator
                  createdBy={user.id as UserId}
                  onTripCreated={id => { setActiveTripId(id); setShowTripCreator(false) }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Trip ID breadcrumb */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-white rounded-2xl px-4 py-3 text-slate-500 text-sm font-mono border border-slate-100 shadow-sm">
                🗂️ Trip: <span className="text-slate-800 font-bold">{activeTripId}</span>
              </div>
              <button
                onClick={() => setActiveTripId(null)}
                className="text-sm text-slate-400 hover:text-slate-600 font-medium whitespace-nowrap"
              >
                Change trip
              </button>
            </div>

            {/* Master Builder */}
            <MasterBuilder tripId={activeTripId} />

            {/* Day-Of Reminders */}
            <DayOfReminders />
          </>
        )}
      </main>
    </div>
  )
}

// Small helper component for entering a trip ID
function TripIdEntry({ onSubmit }: { onSubmit: (id: string) => void }) {
  const [val, setVal] = useState('')
  return (
    <div className="flex gap-2 max-w-sm mx-auto">
      <input
        type="text"
        placeholder="Paste Trip ID..."
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && val.trim() && onSubmit(val.trim())}
        className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
      <button
        onClick={() => val.trim() && onSubmit(val.trim())}
        className="bg-violet-600 text-white font-bold px-4 py-3 rounded-xl text-sm hover:bg-violet-700 transition-all"
      >
        Go
      </button>
    </div>
  )
}
