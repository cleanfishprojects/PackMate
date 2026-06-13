'use client'

import { motion } from 'framer-motion'
import type { PackingItem } from '@/types'

interface Props {
  item: PackingItem
  isPacked: boolean
  isThomas: boolean   // larger touch targets for age 7
  onClick: () => void
  onFlag: () => void
}

export default function PackingCard({ item, isPacked, isThomas, onClick, onFlag }: Props) {
  const remaining = item.targetQuantity - item.packedQuantity
  const isFlagged = !!item.missing

  return (
    <div className="relative flex flex-col">
      <motion.button
        layout
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04, y: -3 }}
        onClick={onClick}
        disabled={isPacked || isFlagged}
        className={`
          relative flex flex-col items-center justify-center rounded-3xl shadow-md
          transition-all text-center
          ${isThomas ? 'p-5 min-h-[130px]' : 'p-4 min-h-[110px]'}
          ${isPacked
            ? 'bg-green-50 border-2 border-green-300 opacity-60'
            : isFlagged
              ? 'bg-red-50 border-2 border-red-300'
              : 'bg-white border-2 border-slate-100 hover:border-violet-300 cursor-pointer'}
        `}
      >
        {isPacked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-green-500/10">
            <span className="text-green-500 text-3xl font-black">✓</span>
          </div>
        )}
        {isFlagged && !isPacked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-red-500/5">
            <span className="text-2xl">🚩</span>
          </div>
        )}
        <span className={`${isThomas ? 'text-5xl' : 'text-4xl'} mb-2 ${isFlagged ? 'opacity-40' : ''}`}>
          {item.visualIcon}
        </span>
        <span className={`font-bold leading-tight ${isThomas ? 'text-sm' : 'text-xs'} ${isFlagged ? 'text-red-400' : 'text-slate-700'}`}>
          {item.name}
        </span>
        {!isPacked && !isFlagged && remaining > 1 && (
          <span className="mt-1 text-xs font-semibold text-violet-500 bg-violet-50 rounded-full px-2 py-0.5">
            ×{remaining}
          </span>
        )}
        {isFlagged && (
          <span className="mt-1 text-xs font-semibold text-red-400">
            can't find it
          </span>
        )}
        {!isPacked && !isFlagged && (
          <span className="mt-1.5 text-xs text-slate-400 font-medium">tap to pack</span>
        )}
      </motion.button>

      {/* Flag / unflag button — only shown on unpacked items */}
      {!isPacked && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={e => { e.stopPropagation(); onFlag() }}
          className={`
            mt-1.5 mx-auto text-xs font-semibold py-1 px-3 rounded-full transition-all
            ${isFlagged
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-slate-100 text-slate-400 hover:bg-orange-100 hover:text-orange-500'}
          `}
        >
          {isFlagged ? '✕ un-flag' : "🚩 can't find"}
        </motion.button>
      )}
    </div>
  )
}
