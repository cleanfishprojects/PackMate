import type { PackingItem } from '@/types'

// Generate a UUID-ish id
function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// Base items that every person gets
const BASE_CLOTHING: Omit<PackingItem, 'id'>[] = [
  { name: 'T-Shirts',        category: 'clothing',   targetQuantity: 5, packedQuantity: 0, visualIcon: '👕' },
  { name: 'Shorts',          category: 'clothing',   targetQuantity: 3, packedQuantity: 0, visualIcon: '🩳' },
  { name: 'Underwear',       category: 'clothing',   targetQuantity: 7, packedQuantity: 0, visualIcon: '🩲' },
  { name: 'Socks',           category: 'clothing',   targetQuantity: 7, packedQuantity: 0, visualIcon: '🧦' },
  { name: 'Pajamas',         category: 'clothing',   targetQuantity: 2, packedQuantity: 0, visualIcon: '😴' },
  { name: 'Sneakers',        category: 'clothing',   targetQuantity: 1, packedQuantity: 0, visualIcon: '👟' },
]

const BASE_TOILETRIES: Omit<PackingItem, 'id'>[] = [
  { name: 'Toothbrush',      category: 'toiletries', targetQuantity: 1, packedQuantity: 0, visualIcon: '🪥' },
  { name: 'Toothpaste',      category: 'toiletries', targetQuantity: 1, packedQuantity: 0, visualIcon: '🦷' },
  { name: 'Shampoo',         category: 'toiletries', targetQuantity: 1, packedQuantity: 0, visualIcon: '🧴' },
  { name: 'Deodorant',       category: 'toiletries', targetQuantity: 1, packedQuantity: 0, visualIcon: '🧼' },
]

const CARRY_ON: Omit<PackingItem, 'id'>[] = [
  { name: 'Tablet / iPad',   category: 'carry-on',   targetQuantity: 1, packedQuantity: 0, visualIcon: '📱' },
  { name: 'Headphones',      category: 'carry-on',   targetQuantity: 1, packedQuantity: 0, visualIcon: '🎧' },
  { name: 'Snacks',          category: 'carry-on',   targetQuantity: 1, packedQuantity: 0, visualIcon: '🍎' },
  { name: 'Water Bottle',    category: 'carry-on',   targetQuantity: 1, packedQuantity: 0, visualIcon: '💧' },
]

export function buildDefaultItems(_userId: string, extraNames: string[]): PackingItem[] {
  const base = [...BASE_CLOTHING, ...BASE_TOILETRIES, ...CARRY_ON]

  // Extra injected items (from weather / activity)
  const extras: Omit<PackingItem, 'id'>[] = extraNames.map(name => ({
    name,
    category: 'clothing' as const,
    targetQuantity: 1,
    packedQuantity: 0,
    visualIcon: '✨',
    injectedByWeather: true,
  }))

  return [...base, ...extras].map(item => ({ ...item, id: uid() }))
}
