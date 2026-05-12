import { supabase } from '../lib/supabase'
import { LogOut } from 'lucide-react'
import ClockWidget from './widgets/ClockWidget'
import TodoWidget from './widgets/TodoWidget'
import WeatherWidget from './widgets/WeatherWidget'
import NewsWidget from './widgets/NewsWidget'
import type { User } from '@supabase/supabase-js'

export default function Dashboard({ user }: { user: User }) {
  const handleLogout = () => supabase.auth.signOut()
  const initial = user.email?.[0].toUpperCase() ?? '?'

  return (
    <div className="min-h-screen relative">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute rounded-full" style={{
          top: '-20%', left: '-8%', width: '560px', height: '560px',
          background: 'radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div className="absolute rounded-full" style={{
          bottom: '-15%', right: '-5%', width: '480px', height: '480px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div className="absolute rounded-full" style={{
          top: '40%', right: '20%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          height: '54px',
          padding: '0 48px',
          background: 'rgba(7,7,15,0.8)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <span className="text-white text-sm font-semibold tracking-widest uppercase" style={{ letterSpacing: '0.12em' }}>
          Dashboard
        </span>
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-xs hidden sm:block">{user.email}</span>
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0 text-violet-300 font-semibold"
            style={{
              width: '26px', height: '26px', fontSize: '11px',
              background: 'rgba(139,92,246,0.18)',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            {initial}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-300 text-xs transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            <LogOut className="w-3 h-3" />
            로그아웃
          </button>
        </div>
      </header>

      {/* Grid */}
      <main className="relative z-10" style={{ padding: '28px 48px 48px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4" style={{ gap: '16px' }}>
          <div className="md:col-span-2 xl:col-span-2">
            <ClockWidget />
          </div>
          <div className="xl:col-span-2">
            <WeatherWidget />
          </div>
          <div className="md:col-span-1 xl:col-span-2" style={{ minHeight: '420px' }}>
            <TodoWidget />
          </div>
          <div className="md:col-span-1 xl:col-span-2" style={{ minHeight: '420px' }}>
            <NewsWidget />
          </div>
        </div>
      </main>
    </div>
  )
}
