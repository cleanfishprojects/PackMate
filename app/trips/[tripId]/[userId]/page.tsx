'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { subscribeToTrip, subscribeToUserLists, updateListItems, updateListStatus } from '@/lib/firestore'
import { USERS, type Trip, type PackingList, type PackingItem, type UserId, type ItemCategory } from '@/types'
import MasterBuilder from '@/components/admin/MasterBuilder'
import AffirmationBanner from '@/components/admin/AffirmationBanner'
import DayOfReminders from '@/components/admin/DayOfReminders'
import KidPackingView from '@/components/child/KidPackingView'
import { AnimatePresence } from 'framer-motion'

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothing:   '👕 Clothing',
  toiletries: '🧴 Toiletries',
  'carry-on': '🎒 Carry-On',
  'day-of':   '📋 Day-Of',
}

function AdminPackingList({ userId, tripId }: { userId: UserId; tripId: string }) {
  const [list, setList] = useState<PackingList | null>(null)

  useEffect(() => {
    return subscribeToUserLists(tripId, userId, lists => {
      setList(lists[0] ?? null)
    })
  }, [tripId, userId])

  async function toggleItem(itemId: string) {
    if (!list) return
    const updated = list.items.map((item): PackingItem =>
      item.id === itemId
        ? item.packedQuantity < item.targetQuantity
          ? { ...item, packedQuantity: item.targetQuantity }
          : { ...item, packedQuantity: 0 }
        : item
    )
    await updateListItems(list.id, updated)
    if (updated.every(i => i.packedQuantity >= i.targetQuantity)) {
      await updateListStatus(list.id, 'completed')
    }
  }

  if (!list) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">📭</div>
        <p>No packing list found for this trip.</p>
        <p className="text-sm mt-1">Create a new trip to generate lists.</p>
      </div>
    )
  }

  const grouped: Partial<Record<ItemCategory, PackingItem[]>> = {}
  list.items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category]!.push(item)
  })

  const total  = list.items.reduce((s, i) => s + i.targetQuantity, 0)
  const packed = list.items.reduce((s, i) => s + i.packedQuantity, 0)
  const pct    = total === 0 ? 0 : Math.round((packed / total) * 100)

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-600">{packed} of {total} items packed</span>
          <span className="text-sm font-bold text-violet-600">{pct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Items by category */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {(Object.entries(grouped) as [ItemCategory, PackingItem[]][]).map(([cat, items]) => (
          <div key={cat}>
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                {CATEGORY_LABELS[cat]}
              </h3>
            </div>
            {items.map(item => {
              const isPacked = item.packedQuantity >= item.targetQuantity
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`
                    w-full flex items-center gap-4 px-5 py-4 border-b border-slate-50
                    text-left transition-colors hover:bg-slate-50
                    ${isPacked ? 'opacity-50' : ''}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${isPacked ? 'bg-violet-500 border-violet-500' : 'border-slate-300'}
                  `}>
                    {isPacked && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-xl">{item.visualIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isPacked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.name}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400 flex-shrink-0">
                    ×{item.targetQuantity}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PackingPage() {
  const router = useRouter()
  const params = useParams()
  const tripId = params.tripId as string
  const userId = params.userId as UserId

  const [trip, setTrip] = useState<Trip | null>(null)
  const [tab, setTab] = useState<'my-list' | 'family'>('my-list')
  const user = USERS.find(u => u.id === userId)

  useEffect(() => {
    const unsub = subscribeToTrip(tripId, setTrip)
    return unsub
  }, [tripId])

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">Unknown user.</div>
  )

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-slate-400">
        <div className="text-4xl mb-3 animate-bounce">📦</div>
        <p>Loading...</p>
      </div>
    </div>
  )

  // ── Kid view ──────────────────────────────────────────────────────────────
  if (user.role === 'child') {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4 pt-4"
          >
            <button onClick={() => router.push(`/trips/${tripId}`)} className="text-slate-400 hover:text-slate-600 text-2xl">←</button>
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-5 pt-4"
        >
          <button onClick={() => router.push(`/trips/${tripId}`)} className="text-slate-400 hover:text-slate-600 text-2xl">←</button>
          <div>
            <h1 className="text-xl font-black text-slate-800">{trip.destination}</h1>
            <p className="text-sm text-slate-500">{user.name}'s view</p>
          </div>
        </motion.div>

        {user.receiveAffirmations && <div className="mb-5"><AffirmationBanner /></div>}

        {/* Tab switcher */}
        <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 mb-6">
          <button
            onClick={() => setTab('my-list')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'my-list' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            🎒 My Packing List
          </button>
          <button
            onClick={() => setTab('family')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'family' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
          >
            👨‍👩‍👦 Family Lists
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'my-list' ? (
            <motion.div
              key="my-list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <AdminPackingList userId={userId} tripId={tripId} />
              <DayOfReminders />
            </motion.div>
          ) : (
            <motion.div
              key="family"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <MasterBuilder tripId={tripId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
