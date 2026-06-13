'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import TripCreator from '@/components/admin/TripCreator'

export default function NewTripPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-slate-50 p-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6 pt-4"
      >
        <button
          onClick={() => router.push('/')}
          className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
        >
          ←
        </button>
        <h1 className="text-2xl font-black text-slate-800">Plan a Trip</h1>
      </motion.div>

      <TripCreator
        createdBy="ben"
        onTripCreated={tripId => router.push(`/trips/${tripId}`)}
      />
    </main>
  )
}
