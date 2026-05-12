import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(20px)',
}

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
    <div className="rounded-2xl flex flex-col items-center justify-center" style={{ ...CARD_STYLE, padding: '36px', gap: '28px' }}>
      {/* Tab */}
      <div className="flex p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['clock', 'timer'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-8 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={tab === t
              ? { background: 'rgba(139,92,246,0.22)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.28)' }
              : { color: '#52525b' }
            }
          >
            {t === 'clock' ? '시계' : '타이머'}
          </button>
        ))}
      </div>

      {tab === 'clock' ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-zinc-600 text-sm">{dateStr}</p>
          <p className="text-6xl font-bold text-white tracking-tight font-mono">{timeStr}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-7">
          <p className="font-bold text-white tracking-tight font-mono" style={{
            fontSize: '58px',
            color: running ? '#a78bfa' : '#fff',
            transition: 'color 0.3s',
          }}>
            {timerStr}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setRunning(r => !r)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-medium transition-all"
              style={{ background: 'rgba(124,58,237,0.85)' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(124,58,237,1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(124,58,237,0.85)'}
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? '일시정지' : '시작'}
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
