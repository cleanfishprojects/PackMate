import type { PackingItem, UserId } from '@/types'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function item(
  name: string,
  category: PackingItem['category'],
  targetQuantity: number,
  visualIcon: string,
  extra?: Partial<Omit<PackingItem, 'id' | 'name' | 'category' | 'targetQuantity' | 'packedQuantity' | 'visualIcon'>>
): Omit<PackingItem, 'id'> {
  return { name, category, targetQuantity, packedQuantity: 0, visualIcon, ...extra }
}

// ─── Adult base items (Ben & Jessica) ────────────────────────────────────────

const ADULT_BASE: Omit<PackingItem, 'id'>[] = [
  item('Short Sleeves',    'clothing',   8, '👕'),
  item('Nice Shirts',      'clothing',   3, '👔'),
  item('Shorts',           'clothing',   4, '🩳'),
  item('Long Pants',       'clothing',   1, '👖'),
  item('Jeans (travel)',   'clothing',   1, '👖'),
  item('Underwear',        'clothing',   9, '🩲'),
  item('Socks',            'clothing',   3, '🧦'),
  item('Pajamas',          'clothing',   2, '😴'),
  item('Toothbrush',       'toiletries', 1, '🪥'),
  item('Toothpaste',       'toiletries', 1, '🦷'),
  item('Shampoo',          'toiletries', 1, '🧴'),
  item('Deodorant',        'toiletries', 1, '🧼'),
  item('Phone Charger',    'carry-on',   1, '🔌'),
  item('Headphones',       'carry-on',   1, '🎧'),
  item('Water Bottle',     'carry-on',   1, '💧'),
  item('Passport / ID',    'day-of',     1, '🪪'),
  item('House Keys',       'day-of',     1, '🔑'),
  item('Medications',      'day-of',     1, '💊'),
]

// ─── Luke (age 10) base items ─────────────────────────────────────────────────

const LUKE_BASE: Omit<PackingItem, 'id'>[] = [
  item('Long Pants',             'clothing',   7, '👖'),
  item('Short Sleeves',          'clothing',   7, '👕'),
  item('Shorts',                 'clothing',   8, '🩳'),
  item('Underwear',              'clothing',   8, '🩲'),
  item('Socks',                  'clothing',   8, '🧦'),
  item('Pajamas / Comfy',        'clothing',   4, '😴'),
  item('Shoes',                  'clothing',   2, '👟'),
  item('Semi Nice Outfit',       'clothing',   1, '👔'),
  item('Long Sleeves',           'clothing',   2, '🧥'),
  item('Sweatshirt',             'clothing',   2, '🧥'),
  item('Light Jacket',           'clothing',   2, '🧥'),
  item('Hat',                    'clothing',   1, '🧢'),
  item('Toothbrush',             'toiletries', 1, '🪥'),
  item('Toothpaste',             'toiletries', 1, '🦷'),
  item('Shampoo',                'toiletries', 1, '🧴'),
  item('Contact Case & Cleaner', 'toiletries', 1, '👁️'),
  item('Water Bottle',           'carry-on',   1, '💧'),
  item('Small Backpack',         'carry-on',   1, '🎒'),
  item('Tablet / iPad',          'carry-on',   1, '📱'),
  item('Headphones',             'carry-on',   1, '🎧'),
]

// ─── Thomas (age 7) base items ────────────────────────────────────────────────

const THOMAS_BASE: Omit<PackingItem, 'id'>[] = [
  item('Long Pants',    'clothing',   1, '👖'),
  item('Shorts',        'clothing',   8, '🩳'),
  item('Short Sleeves', 'clothing',   8, '👕'),
  item('Long Sleeves',  'clothing',   1, '🧥'),
  item('Underwear',     'clothing',   9, '🩲'),
  item('Socks',         'clothing',   9, '🧦'),
  item('Pajamas',       'clothing',   8, '😴'),
  item('Shoes',         'clothing',   1, '👟'),
  item('Hat',           'clothing',   1, '🧢'),
  item('Toothbrush',    'toiletries', 1, '🪥'),
  item('Toothpaste',    'toiletries', 1, '🦷'),
  item('Shampoo',       'toiletries', 1, '🧴'),
  item('Water Bottle',  'carry-on',   1, '💧'),
  item('Tablet / iPad', 'carry-on',   1, '📱'),
  item('Headphones',    'carry-on',   1, '🎧'),
  item('Snacks',        'carry-on',   1, '🍎'),
]

// ─── Activity add-ons ─────────────────────────────────────────────────────────

const ACTIVITY_ADDONS: Record<string, Omit<PackingItem, 'id'>[]> = {
  beach: [
    item('Swimsuit',              'clothing',   2, '🩱'),
    item('Sandals',               'clothing',   2, '👡'),
    item('Water Shoes',           'clothing',   1, '👟'),
    item('Sunglasses',            'clothing',   1, '🕶️'),
    item('Sunscreen',             'toiletries', 4, '🧴', { injectedByWeather: true }),
    item('Beach Towel',           'carry-on',   1, '🏖️', { injectedByWeather: true }),
  ],
  swimming: [
    item('Swimsuit',    'clothing', 2, '🩱'),
    item('Swim Goggles','carry-on', 1, '🥽'),
    item('Pool Bag',    'carry-on', 1, '🎒'),
  ],
  skiing: [
    item('Snow Pants',         'clothing',   1, '🎿'),
    item('Ski Gloves',         'clothing',   1, '🧤'),
    item('Thermal Base Layer', 'clothing',   2, '🧥'),
    item('Ski Socks',          'clothing',   3, '🧦'),
    item('Lip Balm',           'toiletries', 1, '💋'),
    item('Hand Warmers',       'carry-on',   4, '🔥', { injectedByWeather: true }),
  ],
  hiking: [
    item('Hiking Boots',  'clothing', 1, '🥾'),
    item('Trekking Poles','carry-on', 1, '🏔️'),
    item('Blister Pads',  'toiletries',1,'🩹'),
    item('Hydration Pack','carry-on', 1, '💧', { injectedByWeather: true }),
  ],
  casual: [
    item('Comfortable Walking Shoes', 'clothing', 1, '👟'),
    item('Light Jacket',              'clothing', 1, '🧥'),
  ],
  formal: [
    item('Dress Clothes', 'clothing', 1, '👔'),
    item('Dress Shoes',   'clothing', 1, '👞'),
    item('Belt',          'clothing', 1, '👔'),
  ],
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildDefaultItems(userId: UserId, activities: string[]): PackingItem[] {
  let base: Omit<PackingItem, 'id'>[]

  if (userId === 'luke') {
    base = [...LUKE_BASE]
  } else if (userId === 'thomas') {
    base = [...THOMAS_BASE]
  } else {
    base = [...ADULT_BASE]
  }

  // Add activity items, deduplicating by name
  const existingNames = new Set(base.map(i => i.name))
  const addons: Omit<PackingItem, 'id'>[] = []

  activities.forEach(act => {
    ;(ACTIVITY_ADDONS[act] ?? []).forEach(addon => {
      if (!existingNames.has(addon.name)) {
        existingNames.add(addon.name)
        addons.push(addon)
      }
    })
  })

  return [...base, ...addons].map(i => ({ ...i, id: uid() }))
}
