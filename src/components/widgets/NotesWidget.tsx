import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { StickyNote, Plus, Trash2 } from 'lucide-react'
import type { Note } from '../../types'

async function fetchNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as Note[]
}

export default function NotesWidget() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const queryClient = useQueryClient()

  const { data: notes = [], isLoading } = useQuery({ queryKey: ['notes'], queryFn: fetchNotes })

  const selected = notes.find(n => n.id === selectedId)

  useEffect(() => {
    if (selected) setContent(selected.content)
  }, [selectedId])

  useEffect(() => {
    if (notes.length > 0 && !selectedId) {
      setSelectedId(notes[0].id)
    }
  }, [notes])

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('notes')
        .insert({ content: '', user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as Note
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setSelectedId(note.id)
      setContent('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase.from('notes').update({ content }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setSelectedId(null)
      setContent('')
    },
  })

  useEffect(() => {
    if (!selectedId) return
    const timer = setTimeout(() => {
      updateMutation.mutate({ id: selectedId, content })
    }, 800)
    return () => clearTimeout(timer)
  }, [content])

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-400" />
          <h2 className="text-white font-semibold">메모</h2>
        </div>
        <button
          onClick={() => addMutation.mutate()}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-3 flex-1 min-h-0">
        <div className="w-28 flex-shrink-0 overflow-y-auto space-y-1">
          {isLoading ? (
            <p className="text-slate-500 text-xs">로딩 중...</p>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors truncate ${
                  note.id === selectedId
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {note.content.slice(0, 20) || '(빈 메모)'}
              </button>
            ))
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {selectedId ? (
            <>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="메모를 입력하세요..."
                className="flex-1 bg-slate-700/30 border border-slate-600/30 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-yellow-500/50 resize-none transition-colors"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500">자동 저장</span>
                <button
                  onClick={() => deleteMutation.mutate(selectedId)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
              메모를 선택하거나 새로 만드세요
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
