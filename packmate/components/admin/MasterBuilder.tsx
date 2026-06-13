'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subscribeToTripLists, updateListItems, pushListToApproved, resolveMissingFlag } from '@/lib/firestore'
import { USERS, type PackingList, type PackingItem, type UserId, type ItemCategory, type ViewMode } from '@/types'

interface Props {
  tripId: string
}

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothing:   '👕 Clothing',
  toiletries: '🧴 Toiletries',
  'carry-on': '🎒 Carry-On',
  'day-of':   '📋 Day-Of',
}

function getDayLabels(start: string, end: string): string[] {
  const days: string[] = []
  const cur = new Date(start)
  const fin = new Date(end)
  while (cur <= fin) {
    days.push(cur.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export default function MasterBuilder({ tripId }: Props) {
  const [lists, setLists]         = useState<PackingList[]>([])
  const [viewMode, setViewMode]   = useState<ViewMode>('totals')
  const [activeUser, setActiveUser] = useState<UserId>('ben')
  const [pushPending, setPushPending] = useState<Set<string>>(new Set())
  const [pushSuccess, setPushSuccess] = useState(false)

  useEffect(() => {
    const unsub = subscribeToTripLists(tripId, setLists)
    return unsub
  }, [tripId])

  const activeList = lists.find(l => l.userId === activeUser)

  async function adjustQuantity(itemId: string, delta: number) {
    if (!activeList) return
    const updated = activeList.items.map(item =>
      item.id === itemId
        ? { ...item, targetQuantity: Math.max(0, item.targetQuantity + delta) }
        : item
    )
    await updateListItems(activeList.id, updated)
  }

  function togglePush(listId: string) {
    setPushPending(prev => {
      const next = new Set(prev)
      next.has(listId) ? next.delete(listId) : next.add(listId)
      return next
    })
  }

  async function handlePush() {
    if (!pushPending.size) return
    await pushListToApproved(Array.from(pushPending))
    setPushPending(new Set())
    setPushSuccess(true)
    setTimeout(() => setPushSuccess(false), 3000)
  }

  const grouped = (items: PackingItem[]) => {
    const map: Partial<Record<ItemCategory, PackingItem[]>> = {}
    items.forEach(item => {
      if (!map[item.category]) map[item.category] = []
      map[item.category]!.push(item)
    })
    return map
  }

  // All flagged items across every list for this trip
  const allFlagged = lists.flatMap(list => {
    const user = USERS.find(u => u.id === list.userId)
    return list.items
      .filter(i => i.missing)
      .map(i => ({ item: i, list, userName: user?.name ?? list.userId, userEmoji: user?.emoji ?? '👤' }))
  })

  async function handleResolveFlag(listId: string, itemId: string, items: PackingItem[]) {
    await resolveMissingFlag(listId, itemId, items)
  }

  if (!lists.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-5xl mb-3">📦</div>
        <p className="font-medium">No packing lists found for this trip.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Member tabs */}
        <div className="flex gap-2 flex-wrap">
          {USERS.filter(u => lists.some(l => l.userId === u.id)).map(user => {
            const userList = lists.find(l => l.userId === user.id)
            const missingCount = userList?.items.filter(i => i.missing).length ?? 0
            return (
              <button
                key={user.id}
                onClick={() => setActiveUser(user.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all
                  ${activeUser === user.id
                    ? `${user.color} text-white shadow-md`
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                `}
              >
                {user.emoji} {user.name}
                {userList?.status === 'approved' && <span className="text-xs">✅</span>}
                {missingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                    {missingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* View toggle */}
        <div className="ml-auto flex bg-slate-100 rounded-xl p-1 gap-1">
          {(['totals', 'daily'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize
                ${viewMode === mode ? 'bg-white shadow text-slate-800' : 'text-slate-500'}
              `}
            >
              {mode === 'totals' ? '📊 Totals' : '📅 Daily'}
            </button>
          ))}
        </div>
      </div>

      {/* Status pill */}
      {activeList && (
        <div className="flex items-center gap-3">
          <span className={`
            text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide
            ${activeList.status === 'approved'  ? 'bg-green-100 text-green-700'  :
              activeList.status === 'completed' ? 'bg-blue-100 text-blue-700'    :
                                                  'bg-amber-100 text-amber-700'}
          `}>
            {activeList.status}
          </span>
          <span className="text-sm text-slate-500">
            {activeList.items.length} items · {activeList.items.reduce((s, i) => s + i.targetQuantity, 0)} total qty
          </span>
        </div>
      )}

      {/* Item list */}
      {activeList && (
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {(Object.entries(grouped(activeList.items)) as [ItemCategory, PackingItem[]][]).map(([cat, items]) => (
            <div key={cat}>
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 text-sm">{CATEGORY_LABELS[cat]}</h3>
              </div>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl w-8 text-center">{item.visualIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                    {item.injectedByWeather && (
                      <span className="text-xs text-sky-500 font-medium">🌤️ weather auto-added</span>
                    )}
                  </div>

                  {viewMode === 'totals' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-all active:scale-90"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-slate-800">
                        {item.targetQuantity}
                      </span>
                      <button
                        onClick={() => adjustQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold text-lg flex items-center justify-center transition-all active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                      {Array.from({ length: item.targetQuantity }).map((_, i) => (
                        <span key={i} className="text-xs bg-violet-100 text-violet-600 rounded px-1.5 py-0.5 font-medium">
                          Day {i + 1}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Missing Items Alert — shown whenever any kid has flagged something */}
      <AnimatePresence>
        {allFlagged.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border-2 border-red-300 rounded-3xl p-5"
          >
            <h3 className="font-black text-red-700 text-base mb-1 flex items-center gap-2">
              🚩 Can't Find — Action Needed
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {allFlagged.length}
              </span>
            </h3>
            <p className="text-red-500 text-sm mb-4">
              These items were flagged by a kid as missing. Locate them and mark as resolved, or remove from the list.
            </p>
            <div className="space-y-2">
              {allFlagged.map(({ item, list, userName, userEmoji }) => (
                <div
                  key={`${list.id}-${item.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-red-200"
                >
                  <span className="text-2xl">{item.visualIcon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {userEmoji} {userName}
                      {item.missingFlaggedAt && (
                        <> · flagged {new Date(item.missingFlaggedAt).toLocaleTimeString([], { hour: '2-digit', minute