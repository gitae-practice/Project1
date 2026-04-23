import { supabase } from '../lib/supabase'
import { LogOut, LayoutDashboard } from 'lucide-react'
import ClockWidget from './widgets/ClockWidget'
import TodoWidget from './widgets/TodoWidget'
import WeatherWidget from './widgets/WeatherWidget'
import NewsWidget from './widgets/NewsWidget'
import type { User } from '@supabase/supabase-js'

export default function Dashboard({ user }: { user: User }) {
  const handleLogout = () => supabase.auth.signOut()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" style={{ padding: '40px 60px' }}>
      <header className="flex items-center justify-between" style={{ marginBottom: '40px' }}>
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-purple-400" />
          <span className="text-white font-bold text-xl">My Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 auto-rows-auto" style={{ gap: '24px' }}>
        <div className="md:col-span-2 xl:col-span-2">
          <ClockWidget />
        </div>
        <div className="xl:col-span-2">
          <WeatherWidget />
        </div>
        <div className="md:col-span-1 xl:col-span-2" style={{ minHeight: '440px' }}>
          <TodoWidget />
        </div>
        <div className="md:col-span-1 xl:col-span-2" style={{ minHeight: '440px' }}>
          <NewsWidget />
        </div>
      </div>
    </div>
  )
}
