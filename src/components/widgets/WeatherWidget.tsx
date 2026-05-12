import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, CloudLightning, MapPin } from 'lucide-react'

interface WeatherData {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    apparent_temperature: number
  }
}

interface GeoData {
  display_name: string
  address: { city?: string; county?: string; state?: string }
}

function getWeatherInfo(code: number): { label: string; Icon: typeof Sun } {
  if (code === 0) return { label: '맑음', Icon: Sun }
  if (code <= 3) return { label: '구름 조금', Icon: Cloud }
  if (code <= 48) return { label: '안개', Icon: Cloud }
  if (code <= 57) return { label: '이슬비', Icon: CloudRain }
  if (code <= 67) return { label: '비', Icon: CloudRain }
  if (code <= 77) return { label: '눈', Icon: CloudSnow }
  if (code <= 82) return { label: '소나기', Icon: CloudRain }
  if (code <= 94) return { label: '뇌우', Icon: CloudLightning }
  return { label: '흐림', Icon: Cloud }
}

function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 37.5665, lon: 126.978 })
    )
  }, [])

  return { coords }
}

export default function WeatherWidget() {
  const { coords } = useGeolocation()

  const { data: weather, isLoading } = useQuery<WeatherData>({
    queryKey: ['weather', coords],
    queryFn: async () => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords!.lat}&longitude=${coords!.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=ms`
      )
      return res.json()
    },
    enabled: !!coords,
    staleTime: 1000 * 60 * 10,
  })

  const { data: geo } = useQuery<GeoData>({
    queryKey: ['geo', coords],
    queryFn: async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords!.lat}&lon=${coords!.lon}&format=json`
      )
      return res.json()
    },
    enabled: !!coords,
    staleTime: Infinity,
  })

  const cityName = geo?.address.city ?? geo?.address.county ?? geo?.address.state ?? '내 위치'
  const weatherInfo = weather ? getWeatherInfo(weather.current.weather_code) : null

  return (
    <div
      className="rounded-2xl flex flex-col justify-between h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        padding: '28px',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-zinc-500 text-xs font-medium tracking-wider uppercase" style={{ letterSpacing: '0.1em' }}>날씨</p>
        <div className="flex items-center gap-1 text-zinc-600 text-xs">
          <MapPin className="w-3 h-3" />
          {cityName}
        </div>
      </div>

      {(isLoading || !coords) && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.06)', borderTopColor: '#38bdf8' }} />
        </div>
      )}

      {weather && weatherInfo && (
        <>
          <div className="flex items-end justify-between mt-4">
            <div>
              <p className="font-bold text-white" style={{ fontSize: '64px', lineHeight: 1 }}>
                {Math.round(weather.current.temperature_2m)}°
              </p>
              <p className="text-zinc-500 text-sm mt-2">{weatherInfo.label}</p>
            </div>
            <weatherInfo.Icon className="w-16 h-16 text-sky-400/70 mb-1" />
          </div>
          <div
            className="flex gap-5 mt-5 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-400/70" />
              습도 {weather.current.relative_humidity_2m}%
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <Wind className="w-3.5 h-3.5 text-zinc-600" />
              {weather.current.wind_speed_10m}m/s
            </div>
            <div className="text-zinc-500 text-xs">
              체감 {Math.round(weather.current.apparent_temperature)}°
            </div>
          </div>
        </>
      )}
    </div>
  )
}
