import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, CheckSquare } from 'lucide-react'
import type { Todo } from '../../types'

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    addMutation.mutate(input.trim())
    setInput('')
  }

  const done = todos.filter(t => t.completed).length

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">할 일</h2>
        </div>
        <span className="text-xs text-slate-400">{done}/{todos.length} 완료</span>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="새 할 일 추가..."
          className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl px-3 py-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {isLoading ? (
          <p className="text-slate-500 text-sm text-center py-4">로딩 중...</p>
        ) : todos.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">할 일이 없습니다</p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-3 group bg-slate-700/30 hover:bg-slate-700/50 rounded-xl px-3 py-2.5 transition-colors"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleMutation.mutate({ id: todo.id, completed: !todo.completed })}
                className="w-4 h-4 accent-purple-500 cursor-pointer flex-shrink-0"
              />
              <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {todo.title}
              </span>
              <button
                onClick={() => deleteMutation.mutate(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
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
