import { useQuery } from '@tanstack/react-query'
import { Newspaper, ExternalLink } from 'lucide-react'

interface NaverNewsItem {
  title: string
  link: string
  originallink: string
  description: string
  pubDate: string
}

function stripHtml(str: string) {
  return str.replace(/<[^>]*>/g, '')
}

async function fetchNaverNews(): Promise<NaverNewsItem[]> {
  const res = await fetch('/api/news?query=속보&display=10&sort=date')
  if (!res.ok) throw new Error('news fetch failed')
  const json = await res.json()
  return (json.items ?? []) as NaverNewsItem[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor(diff / 60000)
  if (h >= 24) return `${Math.floor(h / 24)}일 전`
  if (h > 0) return `${h}시간 전`
  return `${m}분 전`
}

export default function NewsWidget() {
  const { data: news = [], isLoading, error } = useQuery({
    queryKey: ['naver-news'],
    queryFn: fetchNaverNews,
    staleTime: 1000 * 60 * 15,
  })

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl flex flex-col h-full" style={{ padding: '32px' }}>
      <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
        <Newspaper className="w-5 h-5 text-green-400" />
        <h2 className="text-white font-semibold">네이버 뉴스</h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-slate-500 border-t-green-400 rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <p className="text-slate-500 text-sm text-center py-4">뉴스를 불러올 수 없습니다</p>
        )}
        {news.map((item, i) => (
          <a
            key={i}
            href={item.originallink || item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 group p-2.5 rounded-xl hover:bg-slate-700/40 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">
                {stripHtml(item.title)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-500/70">네이버뉴스</span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-slate-500">{timeAgo(item.pubDate)}</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  )
}
