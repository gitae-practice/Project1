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
  return str.replace(/<[^>]*>/g, '').replace(/&quot;|&amp;|&lt;|&gt;|&apos;|&#[0-9]+;/g, '')
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
    <div
      className="rounded-2xl flex flex-col h-full"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        padding: '28px',
      }}
    >
      <div className="flex items-center gap-2.5 mb-5">
        <Newspaper className="w-4 h-4 text-emerald-400" />
        <h2 className="text-white text-sm font-semibold">네이버 뉴스</h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid rgba(255,255,255,0.06)', borderTopColor: '#34d399' }} />
          </div>
        )}
        {error && (
          <p className="text-zinc-700 text-sm text-center py-4">뉴스를 불러올 수 없습니다</p>
        )}
        {news.map((item, i) => (
          <a
            key={i}
            href={item.originallink || item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group p-2.5 rounded-xl transition-all"
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
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">
                {stripHtml(item.title)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-emerald-500/60">네이버뉴스</span>
                <span className="text-zinc-800 text-xs">·</span>
                <span className="text-xs text-zinc-700">{timeAgo(item.pubDate)}</span>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-zinc-800 group-hover:text-zinc-500 flex-shrink-0 mt-1 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  )
}
