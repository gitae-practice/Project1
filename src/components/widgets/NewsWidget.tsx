import { useQuery } from '@tanstack/react-query'
import { Newspaper, ExternalLink } from 'lucide-react'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
}

async function fetchNews(): Promise<NewsItem[]> {
  const feeds = [
    { url: 'https://feeds.bbci.co.uk/korean/rss.xml', source: 'BBC 코리아' },
    { url: 'https://rss.joins.com/joins_news_list.xml', source: '중앙일보' },
  ]

  const results = await Promise.allSettled(
    feeds.map(async ({ url, source }) => {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
      const json = await res.json()
      return (json.items ?? []).slice(0, 5).map((item: { title: string; link: string; pubDate: string }) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source,
      }))
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 10)
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
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 15,
  })

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <Newspaper className="w-5 h-5 text-green-400" />
        <h2 className="text-white font-semibold">뉴스</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
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
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 group p-2.5 rounded-xl hover:bg-slate-700/40 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-500/70">{item.source}</span>
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
