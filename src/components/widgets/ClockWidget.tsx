import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

export default function ClockWidget() {
  const [now, setNow] = useState(new Date())
  const [tab, setTab] = useState<'clock' | 'timer'>('clock')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const reset = () => { setRunning(false); setElapsed(0) }

  const pad = (n: number) => String(n).padStart(2, '0')
  const timerStr = `${pad(Math.floor(elapsed / 3600))}:${pad(Math.floor((elapsed % 3600) / 60))}:${pad(elapsed % 60)}`
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
      <div className="flex bg-slate-700/50 rounded-xl p-1">
        {(['clock', 'timer'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === t ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'clock' ? '시계' : '타이머'}
          </button>
        ))}
      </div>

      {tab === 'clock' ? (
        <>
          <p className="text-slate-400 text-sm">{dateStr}</p>
          <p className="text-5xl font-bold text-white tracking-tight font-mono">{timeStr}</p>
        </>
      ) : (
        <>
          <p className="text-5xl font-bold text-white tracking-tight font-mono">{timerStr}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setRunning(r => !r)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm transition-colors"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? '일시정지' : '시작'}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          </div>
        </>
      )}
    </div>
  )
}
