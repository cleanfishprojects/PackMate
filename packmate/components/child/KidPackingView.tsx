'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subscribeToUserLists, updateListItems, updateListStatus, toggleMissingFlag } from '@/lib/firestore'
import { type UserId, type PackingList, type PackingItem, type ItemCategory } from '@/types'
import ProgressCircle from './ProgressCircle'
import PackingCard from './PackingCard'
import Celebration from './Celebration'

interface Props {
  userId: UserId
  userName: string
  tripId: string
}

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  clothing:   '👕 Clothes',
  toiletries: '🧴 Toiletries',
  'carry-on': '🎒 Carry-On',
  'day-of':   '📋 Day-Of',
}

export default function KidPackingView({ userId, userName, tripId }: Props) {
  const [list, setList]               = useState<PackingList | null>(null)
  const [celebrating, setCelebrating] = useState(false)
  const isThomas = userId === 'thomas'

  useEffect(() => {
    const unsub = subscribeToUserLists(tripId, userId, lists => {
      const approved = lists.find(l => l.status === 'approved' || l.status === 'completed')
      setList(approved ?? lists[0] ?? null)
    })
    return unsub
  }, [tripId, userId])

  async function packItem(itemId: string) {
    if (!list) return
    const updated = list.items.map(item =>
      item.id === itemId && item.packedQuantity < item.targetQuantity
        // Also clear any missing flag when successfully packing
        ? { ...item, packedQuantity: item.packedQuantity + 1, missing: false, missingFlaggedAt: undefined }
        : item
    )
    await updateListItems(list.id, updated)

    const allPacked = updated.every(i => i.packedQuantity >= i.targetQuantity || i.missing)
    if (allPacked && updated.some(i => i.packedQuantity >= i.targetQuantity)) {
      // Only celebrate if at least something is packed (not if everything is flagged missing)
      const nonMissingComplete = updated
        .filter(i => !i.missing)
        .every(i => i.packedQuantity >= i.targetQuantity)
      if (nonMissingComplete && updated.every(i => i.packedQuantity >= i.targetQuantity)) {
        await updateListStatus(list.id, 'completed')
        setTimeout(() => setCelebrating(true), 600)
      }
    }
  }

  async function flagItem(itemId: string) {
    if (!list) return
    await toggleMissingFlag(list.id, itemId, list.items)
  }

  if (!list) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-black text-slate-700 mb-2">Waiting for your list!</h2>
        <p className="text-slate-400">Mom or Dad will approve your packing list soon.</p>
      </div>
    )
  }

  const totalItems  = list.items.reduce((s, i) => s + i.targetQuantity, 0)
  const packedItems = list.items.reduce((s, i) => s + i.packedQuantity, 0)
  const percent     = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100)
  const flaggedItems = list.items.filter(i => i.missing)

  const grouped: Partial<Record<ItemCategory, PackingItem[]>> = {}
  list.items.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category]!.push(item)
  })

  const unpackedItems   = list.items.filter(i => i.packedQuantity < i.targetQuantity)
  const packedListItems = list.items.filter(i => i.packedQuantity >= i.targetQuantity)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 pb-20">
      <AnimatePresence>
        {celebrating && (
          <Celebration name={userName} onDismiss={() => setCelebrating(false)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <div className="flex-1">
            <h1 className={`font-black text-slate-800 ${isThomas ? 'text-2xl' : 'text-xl'}`}>
              {userName}'s Packing List 🧳
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              {packedItems} of {totalItems} items packed
              {flaggedItems.length > 0 && (
                <span className="ml-2 text-red-500 font-semibold">
                  · 🚩 {flaggedItems.length} can't find
                </span>
              )}
            </p>
          </div>
          <ProgressCircle percent={percent} size={isThomas ? 90 : 75} />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-6">
        {/* Device warning */}
        {grouped['carry-on'] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-3"
          >
            <p className={`font-bold text-amber-800 ${isThomas ? 'text-base' : 'text-sm'}`}>
              📥 Download your favorite shows and games now for offline use on the flight!
            </p>
          </motion.div>
        )}

        {/* Missing items alert banner */}
        <AnimatePresence>
          {flaggedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border-2 border-red-300 rounded-2xl px-4 py-3"
            >
              <p className={`font-bold text-red-700 mb-1 ${isThomas ? 'text-base' : 'text-sm'}`}>
                🚩 Mom or Dad has been told you can't find:
              </p>
              <ul className="space-y-0.5">
                {flaggedItems.map(item => (
                  <li key={item.id} className="text-red-600 text-sm font-medium flex items-center gap-2">
                    <span>{item.visualIcon}</span> {item.name}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Still to pack */}
        {unpackedItems.length > 0 && (
          <div>
            <h2 className={`font-black text-slate-700 mb-3 ${isThomas ? 'text-xl' : 'text-lg'}`}>
              🗂️ Still to pack
            </h2>
            {(Object.entries(grouped) as [ItemCategory, PackingItem[]][]).map(([cat, items]) => {
              const unpacked = items.filter(i => i.packedQuantity < i.targetQuantity)
              if (!unpacked.length) return null
              return (
                <div key={cat} className="mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <div className={`grid gap-3 ${isThomas ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {unpacked.map(item => (
                      <PackingCard
                        key={item.id}
                        item={item}
                        isPacked={false}
                        isThomas={isThomas}
                        onClick={() => packItem(item.id)}
                        onFlag={() => flagItem(item.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* In the suitcase */}
        {packedListItems.length > 0 && (
          <div>
            <h2 className={`font-black text-green-700 mb-3 ${isThomas ? 'text-xl' : 'text-lg'}`}>
              ✅ In the suitcase
            </h2>
            <div className={`grid gap-3 ${isThomas ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {packedListItems.map(item => (
                <PackingCard
                  key={item.id}
                  item={item}
                  isPacked={true}
                  isThomas={isThomas}
                  onClick={() => {}}
                  onFlag={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {list.items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🎒</div>
            <p className="text-slate-400 font-medium">Your list is empty!</p>
          </div>
        )}
      </div>
    </div>
  )
}
