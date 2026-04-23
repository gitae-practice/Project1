import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { query = '속보', display = '10', sort = 'date' } = req.query

  const response = await fetch(
    `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query as string)}&display=${display}&sort=${sort}`,
    {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
      },
    }
  )

  const data = await response.json()
  res.setHeader('Cache-Control', 's-maxage=900')
  res.json(data)
}
