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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-purple-400" />
          <span className="text-white font-semibold">My Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-sm transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-auto">
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
    </div>
  )
}
