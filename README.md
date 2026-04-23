# Personal Dashboard

개발 연습을 위한 커스텀 대시보드 웹앱

## 기능

- **시계 / 스톱워치** — 현재 시각 표시 및 스톱워치 기능
- **할 일 관리** — 할 일 추가, 완료 체크, 삭제
- **날씨** — 현재 위치 기반 실시간 날씨 정보
- **뉴스 피드** — 최신 뉴스 목록

## 기술 스택

- React / TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth, PostgreSQL)
- TanStack Query
- Open-Meteo API (날씨)

## 실행 방법

```bash
npm install
npm run dev
```

## 환경변수 설정

`.env.example`을 복사해 `.env` 파일을 만들고 Supabase 프로젝트 정보를 입력.

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## DB 설정

`supabase/schema.sql` 파일을 Supabase SQL Editor에서 실행하면 필요한 테이블이 생성.
