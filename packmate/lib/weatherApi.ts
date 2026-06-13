import type { WeatherForecast } from '@/types'

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

// Activity → injected items mapping
const ACTIVITY_ITEMS: Record<string, string[]> = {
  beach:    ['Sunscreen 🧴', 'Sunglasses 🕶️', 'Beach towel 🏖️', 'Flip flops 👡', 'Swim cover-up'],
  swimming: ['Swim goggles 🥽', 'Swimsuit 🩱', 'Pool bag'],
  skiing:   ['Snow pants 🎿', 'Ski gloves 🧤', 'Thermal base layer', 'Ski socks', 'Lip balm'],
  hiking:   ['Hiking boots 🥾', 'Trekking poles', 'Blister pads', 'Hydration pack 💧'],
  casual:   ['Comfortable walking shoes 👟', 'Light jacket'],
  formal:   ['Dress clothes 👔', 'Dress shoes', 'Belt'],
}

function getWeatherInjectedItems(
  precipProb: number,
  tempF: number,
  activities: string[]
): string[] {
  const items = new Set<string>()

  // Weather-based
  if (precipProb > 0.5) items.add('Rain jacket 🌧️')
  if (precipProb > 0.5) items.add('Compact umbrella ☂️')
  if (tempF < 45)       items.add('Heavy winter coat 🧥')
  if (tempF < 55)       items.add('Warm hat & gloves 🧤')
  if (tempF > 85)       items.add('Extra sunscreen SPF 50+')
  if (tempF > 90)       items.add('Cooling towel 🧊')

  // Activity-based
  activities.forEach(act => {
    ACTIVITY_ITEMS[act]?.forEach(item => items.add(item))
  })

  return Array.from(items)
}

export async function fetchWeatherForecast(
  destination: string,
  activities: string[]
): Promise<WeatherForecast> {
  if (!API_KEY) throw new Error('OpenWeatherMap API key not configured')

  // Geocode the destination first
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${API_KEY}`
  const geoRes = await fetch(geoUrl)
  if (!geoRes.ok) throw new Error(`Geocoding failed: ${geoRes.statusText}`)
  const geoData = await geoRes.json()
  if (!geoData.length) throw new Error(`Could not find location: ${destination}`)

  const { lat, lon } = geoData[0]

  // Fetch current weather (imperial units = °F)
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
  const weatherRes = await fetch(weatherUrl)
  if (!weatherRes.ok) throw new Error(`Weather fetch failed: ${weatherRes.statusText}`)
  const data = await weatherRes.json()

  const temp    = Math.round(data.main.temp)
  const tempMin = Math.round(data.main.temp_min)
  const tempMax = Math.round(data.main.temp_max)
  const condition   = data.weather[0].main as string
  const description = data.weather[0].description as string
  const icon        = data.weather[0].icon as string

  // Approximate precipitation probability from weather condition
  const rainyConditions = ['Rain', 'Drizzle', 'Thunderstorm', 'Snow']
  const precipProb = rainyConditions.includes(condition) ? 0.75 : 0.1

  const injectedItems = getWeatherInjectedItems(precipProb, temp, activities)

  return {
    temp,
    tempMin,
    tempMax,
    condition,
    description,
    icon,
    precipitationProbability: precipProb,
    injectedItems,
  }
}
