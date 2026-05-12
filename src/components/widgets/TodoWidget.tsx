import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, CheckSquare, Pencil, Check } from 'lucide-react'
import type { Todo } from '../../types'

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(20px)',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const h = d.getHours()
  const min = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  const hour = String(h % 12 || 12)
  return `${yyyy}-${mm}-${dd} ${ampm}${hour}시${min}분`
}

async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Todo[]
}

export default function TodoWidget() {
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: todos = [], isLoading } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('todos').insert({ title, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from('todos').update({ completed }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const editMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase.from('todos').update({ title }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.title)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  const handleEditSave = (id: string) => {
    if (editingText.trim()) editMutation.mutate({ id, title: editingText.trim() })
    setEditingId(null)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    addMutation.mutate(input.trim())
    setInput('')
  }

  const done = todos.filter(t => t.completed).length

  return (
    <div className="rounded-2xl flex flex-col h-full" style={{ ...CARD_STYLE, padding: '28px' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-4 h-4 text-violet-400" />
          <h2 className="text-white text-sm font-semibold">할 일</h2>
        </div>
        <span className="text-xs text-zinc-700">{done}/{todos.length} 완료</span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="할 일 추가"
          className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.45)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="rounded-xl px-3 py-2 text-white disabled:opacity-40 transition-all"
          style={{ background: 'rgba(124,58,237,0.85)' }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(124,58,237,1)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(124,58,237,0.85)'}
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {isLoading ? (
          <p className="text-zinc-700 text-sm text-center py-4">로딩 중...</p>
        ) : todos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8">
            <CheckSquare className="w-8 h-8 text-zinc-800" />
            <p className="text-zinc-700 text-sm">할 일이 없습니다</p>
          </div>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 group rounded-xl px-3 py-2.5 transition-all cursor-default"
              style={{ border: '1px solid transparent' }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.035)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleMutation.mutate({ id: todo.id, completed: !todo.completed })}
                className="w-3.5 h-3.5 accent-violet-500 cursor-pointer flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                {editingId === todo.id ? (
                  <input
                    ref={editInputRef}
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEditSave(todo.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onBlur={() => handleEditSave(todo.id)}
                    className="w-full rounded-lg px-2 py-0.5 text-sm text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.4)' }}
                  />
                ) : (
                  <span className={`block text-sm ${todo.completed ? 'line-through text-zinc-700' : 'text-zinc-200'}`}>
                    {todo.title}
                  </span>
                )}
                <span className="block text-xs text-zinc-700 mt-0.5">
                  {formatDate(todo.created_at)}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    · 수정 {formatDate(todo.updated_at)}
                  </span>
                </span>
              </div>
              {editingId === todo.id ? (
                <button
                  onClick={() => handleEditSave(todo.id)}
                  className="text-violet-400 hover:text-violet-300 transition-all flex-shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleEditStart(todo)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-violet-400 transition-all flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
