# TaskFlow ⚡

> 개인 할일 & 프로젝트를 칸반 보드로 직관적으로 관리하는 웹앱

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)
![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748)

## ✨ Features

- **프로젝트별 관리** — 업무, 사이드 프로젝트, 개인 목표를 분류
- **칸반 보드** — To Do / In Progress / Done 3컬럼 드래그 앤 드롭
- **우선순위 & 마감일** — 컬러 코딩으로 한눈에 파악
- **실시간 대시보드** — 진행률, 완료, 지연 현황
- **검색 & 필터** — 키워드 검색 + 우선순위 필터링

## 🚀 Quick Start

```bash
# 1. 의존성 설치
npm install

# 2. DB 초기화
npx prisma db push

# 3. 샘플 데이터 (선택)
npm run db:seed

# 4. 개발 서버
npm run dev
```

→ http://localhost:3000

## 🧪 Testing

```bash
npm test              # 71 test cases
npm run test:coverage # 커버리지 리포트
```

## 🌐 Deploy

```bash
vercel   # Vercel CLI로 배포
```

자세한 배포 가이드: [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md)

## 📁 Project Structure

```
taskflow/
├── app/
│   ├── api/projects/    # 프로젝트 CRUD API
│   ├── api/tasks/       # 할일 CRUD + 필터 API
│   ├── globals.css      # Tailwind + 커스텀 스타일
│   ├── layout.tsx       # Root layout (SEO, 메타태그)
│   └── page.tsx         # 메인 대시보드 (칸반 보드)
├── components/
│   ├── KanbanColumn.tsx # 칸반 컬럼 (Droppable)
│   ├── Sidebar.tsx      # 프로젝트 목록 + 통계
│   ├── TaskCard.tsx     # 태스크 카드 (Draggable)
│   └── TaskModal.tsx    # 추가/수정 모달
├── lib/
│   ├── api.ts           # 클라이언트 API 헬퍼
│   ├── prisma.ts        # Prisma 싱글톤
│   └── types.ts         # 타입 & 상수
├── prisma/
│   ├── schema.prisma           # SQLite (개발)
│   ├── schema.production.prisma # PostgreSQL (프로덕션)
│   └── seed.ts                 # 샘플 데이터
├── __tests__/           # 71 테스트 케이스
├── .github/workflows/   # CI/CD
└── QA_REPORT.md         # QA 체크리스트
```

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| Database | SQLite → Vercel Postgres |
| ORM | Prisma 6.3 |
| Drag & Drop | @hello-pangea/dnd |
| Testing | Jest + Testing Library |
| Deploy | Vercel (ICN region) |

## 📄 License

MIT
