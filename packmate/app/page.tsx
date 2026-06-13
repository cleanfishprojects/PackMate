'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { USERS } from '@/types'

export default function ProfileSelector() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="text-7xl mb-4">🧳</div>
        <h1 className="text-5xl font-black text-slate-800 tracking-tight">PackMate</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Who's packing today?</p>
      </motion.div>

      {/* Profile Grid */}
      <div className="grid grid-cols-2 gap-5 w-full max-w-md">
        {USERS.map((user, i) => (
          <motion.button
            key={user.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/${user.id}`)}
            className={`
              relative flex flex-col items-center justify-center
              p-8 rounded-3xl shadow-lg cursor-pointer
              ${user.color} text-white
              transition-shadow hover:shadow-xl
            `}
          >
            {/* Role badge */}
            {user.role === 'admin' && (
              <span className="absolute top-3 right-3 text-xs font-bold bg-white/25 rounded-full px-2 py-0.5">
                Admin
              </span>
            )}
            <span className="text-5xl mb-3">{user.emoji}</span>
            <span className="text-xl font-bold">{user.name}</span>
            {user.role === 'child' && (
              <span className="text-xs mt-1 opacity-80">
                {user.id === 'luke' ? 'Age 10' : 'Age 7'}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-slate-400 text-sm"
      >
        Tap your name to get started ✈️
      </motion.p>
    </main>
  )
}
