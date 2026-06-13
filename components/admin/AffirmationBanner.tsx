'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AFFIRMATIONS } from '@/types'

export default function AffirmationBanner() {
  const [msg, setMsg] = useState(AFFIRMATIONS[0])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Rotate every 8 seconds
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMsg(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
        setVisible(true)
      }, 400)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl p-4 mb-6 shadow-lg">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-white font-semibold text-center text-sm md:text-base"
          >
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
