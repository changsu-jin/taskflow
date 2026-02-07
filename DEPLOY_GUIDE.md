# TaskFlow 배포 가이드

## 🚀 Quick Deploy (3분)

### Step 1: GitHub 리포지토리 생성

```bash
cd taskflow
git init
git add .
git commit -m "feat: TaskFlow MVP - initial release"

# GitHub에서 새 리포지토리 생성 후
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git branch -M main
git push -u origin main
```

### Step 2: Vercel 배포

```bash
# 방법 A: Vercel CLI (권장)
npm i -g vercel
vercel login
vercel

# 방법 B: Vercel 대시보드
# 1. https://vercel.com/new 접속
# 2. GitHub 리포지토리 Import
# 3. Framework: Next.js 자동 감지
# 4. Deploy 클릭
```

### Step 3: 데이터베이스 전환 (프로덕션)

> ⚠️ SQLite는 Vercel Serverless에서 write가 불가능합니다.
> 프로덕션에서는 아래 중 하나로 전환하세요.

#### Option A: Vercel Postgres (가장 간편)

```bash
# 1. Vercel Dashboard > Storage > Create Database > Postgres
# 2. 자동으로 환경변수 설정됨

# 3. prisma/schema.prisma 수정
# provider = "postgresql"
# url = env("POSTGRES_PRISMA_URL")
# directUrl = env("POSTGRES_URL_NON_POOLING")

# 4. 재배포
npx prisma db push
vercel --prod
```

#### Option B: Turso (SQLite 호환, 무료)

```bash
# 1. https://turso.tech 가입
turso db create taskflow
turso db tokens create taskflow

# 2. .env 수정
# DATABASE_URL="libsql://taskflow-YOUR_ORG.turso.io"
# DATABASE_AUTH_TOKEN="your-token"

# 3. prisma/schema.prisma 수정
# provider = "sqlite"  (그대로)
# + previewFeatures = ["driverAdapters"]
```

#### Option C: PlanetScale (MySQL 호환)

```bash
# 1. https://planetscale.com 가입 & DB 생성
# 2. prisma schema: provider = "mysql"
# 3. CONNECTION_STRING 환경변수 설정
```

### Step 4: 환경변수 설정

Vercel Dashboard > Settings > Environment Variables:

| Key | Value | Env |
|-----|-------|-----|
| `DATABASE_URL` | DB 연결 문자열 | Production |
| `NEXTAUTH_SECRET` | 랜덤 시크릿 (Post-MVP) | Production |
| `NEXTAUTH_URL` | https://your-domain.vercel.app | Production |

### Step 5: 커스텀 도메인 (선택)

```bash
# Vercel Dashboard > Settings > Domains
# 1. 도메인 추가: taskflow.example.com
# 2. DNS 설정: CNAME → cname.vercel-dns.com
# 3. SSL 자동 적용 (Let's Encrypt)
```

---

## 📋 배포 체크리스트

### Pre-Deploy
- [ ] `npm run build` 로컬 빌드 성공
- [ ] `npm test` 전체 테스트 통과
- [ ] `.env` 파일이 `.gitignore`에 포함
- [ ] 민감 정보 하드코딩 없음
- [ ] `prisma generate` 정상 실행

### Post-Deploy
- [ ] 프로덕션 URL 접속 확인
- [ ] 프로젝트 생성/조회 동작
- [ ] 할일 추가/수정/삭제 동작
- [ ] 드래그앤드롭 동작
- [ ] 모바일 접속 확인
- [ ] HTTPS 적용 확인
- [ ] 에러 로그 모니터링 설정

### Performance
- [ ] Lighthouse 점수 확인 (목표: 90+)
- [ ] Core Web Vitals 통과
- [ ] 이미지 최적화 (next/image)
- [ ] 번들 사이즈 확인 (`next build` 출력)

---

## 🔧 CI/CD 파이프라인 (선택)

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prisma generate
      - run: npm test
      - run: npm run build
```

Vercel은 GitHub 연동 시 PR마다 Preview Deploy를 자동 생성합니다.

---

## 📊 모니터링 (Post-Deploy)

### Vercel Analytics (무료)
```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx에 추가
import { Analytics } from '@vercel/analytics/react';

// <body> 안에 추가
<Analytics />
```

### Error Tracking (Sentry 추천)
```bash
npx @sentry/wizard@latest -i nextjs
```
