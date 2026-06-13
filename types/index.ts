export type UserId = 'ben' | 'jessica' | 'luke' | 'thomas'
export type UserRole = 'admin' | 'child'

export interface User {
  id: UserId
  name: string
  role: UserRole
  receiveAffirmations: boolean
  emoji: string
  color: string // Tailwind bg class
}

export interface Trip {
  id: string
  destination: string
  startDate: string  // ISO date string
  endDate: string
  activities: string[]
  members: UserId[]
  weatherForecast?: WeatherForecast
  createdAt: string
  createdBy: UserId
}

export interface WeatherForecast {
  temp: number        // °F
  tempMin: number
  tempMax: number
  condition: string
  description: string
  icon: string
  precipitationProbability: number  // 0–1
  injectedItems: string[]
}

export type ListStatus = 'draft' | 'approved' | 'completed'

export interface PackingList {
  id: string
  tripId: string
  userId: UserId
  status: ListStatus
  items: PackingItem[]
  updatedAt: string
}

export type ItemCategory = 'clothing' | 'toiletries' | 'carry-on' | 'day-of'

export interface PackingItem {
  id: string
  name: string
  category: ItemCategory
  targetQuantity: number
  packedQuantity: number
  visualIcon: string  // emoji
  dayAssignments?: string[]  // ISO date strings for daily view
  injectedByWeather?: boolean
  missing?: boolean        // kid flagged this as can't-find
  missingFlaggedAt?: string  // ISO timestamp of flag
}

export interface DayOfReminder {
  id: string
  text: string
  checked: boolean
  icon: string
}

// ---- UI helpers ----
export type ViewMode = 'totals' | 'daily'

export const USERS: User[] = [
  { id: 'ben',     name: 'Ben',     role: 'admin', receiveAffirmations: true,  emoji: '👨', color: 'bg-blue-500'   },
  { id: 'jessica', name: 'Jessica', role: 'admin', receiveAffirmations: false, emoji: '👩', color: 'bg-purple-500' },
  { id: 'luke',    name: 'Luke',    role: 'child', receiveAffirmations: false, emoji: '🧒', color: 'bg-green-500'  },
  { id: 'thomas',  name: 'Thomas',  role: 'child', receiveAffirmations: false, emoji: '👦', color: 'bg-orange-500' },
]

export const AFFIRMATIONS = [
  "You're crushing it, Ben! 🙌",
  "The family logistics wizard strikes again! 🧙‍♂️",
  "No one plans a trip like you do. Seriously. 💪",
  "You thought of everything. As always. 🌟",
  "Behind every great family trip is you, planning it all. ❤️",
  "This trip is going to be amazing because of your prep work! ✈️",
  "You're the MVP of this family adventure! 🏆",
  "Look at you, keeping it all together. Legend. 🦁",
]

export const DEFAULT_DAY_OF_REMINDERS: DayOfReminder[] = [
  { id: 'keys',     text: 'House keys',             checked: false, icon: '🔑' },
  { id: 'chargers', text: 'Phone & tablet chargers', checked: false, icon: '🔌' },
  { id: 'snacks',   text: 'Snacks for the road',     checked: false, icon: '🍎' },
  { id: 'lock',     text: 'Lock the front door',     checked: false, icon: '🔒' },
  { id: 'passport', text: 'Passports / IDs',         checked: false, icon: '🪪' },
  { id: 'meds',     text: 'Medications',             checked: false, icon: '💊' },
]

export const ACTIVITY_OPTIONS = [
  { id: 'beach',   label: 'Beach',   emoji: '🏖️' },
  { id: 'swimming',label: 'Swimming',emoji: '🏊' },
  { id: 'skiing',  label: 'Skiing',  emoji: '⛷️' },
  { id: 'hiking',  label: 'Hiking',  emoji: '🥾' }