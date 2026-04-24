export interface Todo {
  id: string
  user_id: string
  title: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
}
