'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface Props {
  name: string
  onDismiss: () => void
}

export default function Celebration({ name, onDismiss }: Props) {
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const duration = 4000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#22c55e'],
      })
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b', '#22c55e'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-center px-8"
      >
        <div className="text-8xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-5xl font-black text-white mb-4">
          All packed, {name}!
        </h1>
        <p className="text-purple-200 text-xl mb-10 font-medium">
          You're totally ready for this trip! 🚀
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={onDismiss}
          className="bg-white text-violet-700 font-black text-xl px-10 py-5 rounded-3xl shadow-2xl"
        >
          Let's go! ✈️
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
