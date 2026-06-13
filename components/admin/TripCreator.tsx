'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ACTIVITY_OPTIONS, USERS, type UserId } from '@/types'
import { fetchWeatherForecast } from '@/lib/weatherApi'
import { createTrip, createPackingList } from '@/lib/firestore'
import { buildDefaultItems } from '@/lib/defaultItems'
import type { WeatherForecast } from '@/types'

interface Props {
  createdBy: UserId
  onTripCreated: (tripId: string) => void
}

export default function TripCreator({ createdBy, onTripCreated }: Props) {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [activities, setActivities]   = useState<string[]>([])
  const [members, setMembers]         = useState<UserId[]>(['ben', 'jessica', 'luke', 'thomas'])
  const [loading, setLoading]         = useState(false)
  const [weather, setWeather]         = useState<WeatherForecast | null>(null)
  const [error, setError]             = useState('')

  function toggleActivity(id: string) {
    setActivities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  function toggleMember(id: UserId) {
    setMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  async function handleCreate() {
    if (!destination || !startDate || !endDate) {
      setError('Please fill in destination and dates.')
      return
    }
    setError('')
    setLoading(true)
    try {
      // 1. Fetch weather
      let forecast: WeatherForecast | undefined
      try {
        forecast = await fetchWeatherForecast(destination, activities)
        setWeather(forecast)
      } catch (e) {
        console.warn('Weather fetch failed, continuing without it:', e)
      }

      // 2. Create the trip document
      const tripId = await createTrip({
        destination,
        startDate,
        endDate,
        activities,
        members,
        ...(forecast ? { weatherForecast: forecast } : {}),
        createdBy,
      })

      // 3. Generate packing lists for each member
      await Promise.all(
        members.map(userId =>
          createPackingList({
            tripId,
            userId,
            status: 'draft',
            items: buildDefaultItems(userId, activities),
          })
        )
      )

      onTripCreated(tripId)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-6 space-y-6"
    >
      <h2 className="text-2xl font-black text-slate-800">✈️ Plan a Trip</h2>

      {/* Destination */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1">Destination</label>
        <input
          type="text"
          placeholder="e.g. Orlando, FL"
          value={destination}
          onChange={e => setDestination(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm"
          />
        </div>
      </div>

      {/* Activities */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">Activities</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_OPTIONS.map(act => (
            <button
              key={act.id}
              onClick={() => toggleActivity(act.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-semibold transition-all
                ${activities.includes(act.id)
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
              `}
            >
              {act.emoji} {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">Who's coming?</label>
        <div className="flex gap-3">
          {USERS.map(user => (
            <button
              key={user.id}
              onClick={() => toggleMember(user.id)}
              className={`
                flex flex-col items-center p-3 rounded-2xl text-sm font-semibold transition-all
                ${members.includes(user.id)
                  ? `${user.color} text-white shadow-md`
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
              `}
            >
              <span className="text-2xl">{user.emoji}</span>
              <span className="mt-1">{user.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weather preview (after fetch) */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-sky-50 border border-sky-200 rounded-2xl p-4"
        >
          <p className="text-sm font-semibold text-sky-700 mb-1">
            🌤️ Weather at {destination}: {weather.temp}°F — {weather.description}
          </p>
          {weather.injectedItems.length > 0 && (
            <p className="text-xs text-sky-600">
              Auto-added: {weather.injectedItems.slice(0, 3).join(', ')}
              {weather.injectedItems.length > 3 && ` +${weather.injectedItems.length - 3} more`}
            </p>
          )}
        </motion.div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-bold rounded-2xl py-4 text-base transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        {loading ? '⏳ Creating lists...' : '🚀 Create Trip & Generate Lists'}
      </button>
    </motion.div>
  )
}
