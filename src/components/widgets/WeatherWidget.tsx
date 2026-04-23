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
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl flex flex-col justify-between h-full" style={{ padding: '32px' }}>
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm font-medium">날씨</p>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <MapPin className="w-3 h-3" />
          {cityName}
        </div>
      </div>

      {(isLoading || !coords) && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-purple-400 rounded-full animate-spin" />
        </div>
      )}

      {weather && weatherInfo && (
        <>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-5xl font-bold text-white">{Math.round(weather.current.temperature_2m)}°</p>
              <p className="text-slate-400 text-sm mt-1">{weatherInfo.label}</p>
            </div>
            <weatherInfo.Icon className="w-14 h-14 text-blue-300" />
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              습도 {weather.current.relative_humidity_2m}%
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              {weather.current.wind_speed_10m}m/s
            </div>
            <div className="text-slate-400 text-xs">
              체감 {Math.round(weather.current.apparent_temperature)}°
            </div>
          </div>
        </>
      )}
    </div>
  )
}
