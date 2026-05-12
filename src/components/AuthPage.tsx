import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, UserPlus } from 'lucide-react'

function parseError(msg: string): string {
  if (msg.includes('User already registered')) return '이미 사용 중인 이메일입니다.'
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (msg.includes('Password should be at least')) return '비밀번호는 최소 6자 이상이어야 합니다.'
  if (msg.includes('Unable to validate email')) return '유효하지 않은 이메일 형식입니다.'
  return msg
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(parseError(error.message))
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(parseError(error.message))
      } else if (data.user && data.user.identities?.length === 0) {
        setError('이미 사용 중인 이메일입니다.')
      } else {
        setMessage('회원가입이 완료되었습니다. 로그인해주세요.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  const reset = (m: 'login' | 'signup') => {
    setMode(m); setEmail(''); setPassword(''); setError(''); setMessage('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{
          top: '-10%', left: '-10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
        <div className="absolute rounded-full" style={{
          bottom: '-10%', right: '-10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(14,165,233,0.09) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-white font-semibold text-xl tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>
            Dashboard
          </p>
          <p className="text-zinc-600 text-sm mt-2">나만의 개인 대시보드</p>
        </div>

        <div
          className="rounded-2xl p-7"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Tab */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => reset(m)}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={mode === m
                  ? { background: 'rgba(139,92,246,0.22)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.28)' }
                  : { color: '#52525b' }
                }
              >
                {m === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-600 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.14)' }}>
                {error}
              </p>
            )}
            {message && (
              <p className="text-emerald-400 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.14)' }}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all mt-2"
              style={{ background: 'rgba(124,58,237,0.85)' }}
              onMouseOver={e => !loading && (e.currentTarget.style.background = 'rgba(124,58,237,1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.85)')}
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white' }} />
              ) : mode === 'login' ? (
                <><LogIn className="w-3.5 h-3.5" /> 로그인</>
              ) : (
                <><UserPlus className="w-3.5 h-3.5" /> 회원가입</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
