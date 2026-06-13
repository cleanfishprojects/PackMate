'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DEFAULT_DAY_OF_REMINDERS, type DayOfReminder } from '@/types'

export default function DayOfReminders() {
  const [reminders, setReminders] = useState<DayOfReminder[]>(DEFAULT_DAY_OF_REMINDERS)

  function toggle(id: string) {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, checked: !r.checked } : r)
    )
  }

  const done = reminders.filter(r => r.checked).length

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-800 text-lg">📋 Day-Of Reminders</h3>
        <span className="text-sm font-semibold text-slate-500">
          {done}/{reminders.length}
        </span>
      </div>
      <p className="text-slate-500 text-sm mb-4">Things that can't be packed in advance.</p>

      <div className="space-y-2">
        {reminders.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggle(r.id)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
              ${r.checked
                ? 'bg-green-50 border border-green-200'
                : 'bg-slate-50 border border-slate-100 hover:bg-slate-100'}
            `}
          >
            <span className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${r.checked ? 'bg-green-500 border-green-500' : 'border-slate-300'}
            `}>
              {r.checked && <span className="text-white text-xs font-bold">✓</span>}
            </span>
            <span className="text-lg">{r.icon}</span>
            <span className={`font-medium text-sm ${r.checked ? 'text-green-700 line-through' : 'text-slate-700'}`}>
              {r.text}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
