import { useQuery } from '@tanstack/react-query'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react'

interface WeatherData {
  name: string
  main: { temp: number; feels_like: number; humidity: number }
  weather: { main: string; description: string }[]
  wind: { speed: number }
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const CITY = 'Seoul'

async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=kr`
  )
  if (!res.ok) throw new Error('날씨 정보를 가져올 수 없습니다')
  return res.json()
}

function WeatherIcon({ main, className }: { main: string; className?: string }) {
  const props = { className: className ?? 'w-12 h-12' }
  if (main === 'Rain' || main === 'Drizzle') return <CloudRain {...props} />
  if (main === 'Snow') return <CloudSnow {...props} />
  if (main === 'Clear') return <Sun {...props} />
  if (main === 'Wind') return <Wind {...props} />
  return <Cloud {...props} />
}

export default function WeatherWidget() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['weather'],
    queryFn: fetchWeather,
    staleTime: 1000 * 60 * 10,
    retry: false,
  })

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between h-full">
      <p className="text-slate-400 text-sm font-medium">날씨</p>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-slate-500 border-t-purple-400 rounded-full animate-spin" />
        </div>
      )}

      {error && !import.meta.env.VITE_WEATHER_API_KEY && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <Cloud className="w-10 h-10 text-slate-600" />
          <p className="text-slate-500 text-sm">API 키를 설정해주세요</p>
          <p className="text-slate-600 text-xs">openweathermap.org</p>
        </div>
      )}

      {error && import.meta.env.VITE_WEATHER_API_KEY && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 text-sm">날씨 정보를 불러올 수 없습니다</p>
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-5xl font-bold text-white">{Math.round(data.main.temp)}°</p>
              <p className="text-slate-400 text-sm mt-1 capitalize">{data.weather[0].description}</p>
              <p className="text-slate-500 text-xs mt-0.5">{data.name}</p>
            </div>
            <WeatherIcon main={data.weather[0].main} className="w-14 h-14 text-blue-300" />
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              습도 {data.main.humidity}%
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              {data.wind.speed}m/s
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              체감 {Math.round(data.main.feels_like)}°
            </div>
          </div>
        </>
      )}
    </div>
  )
}
