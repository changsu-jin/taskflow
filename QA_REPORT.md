# TaskFlow MVP - QA 테스트 계획 & 체크리스트

**Version**: 1.0  
**Date**: 2026-02-07  
**Tester**: Claude AI + 진창수

---

## 1. 코드 리뷰 결과 (Static Analysis)

### 🐛 발견 & 수정된 버그

| # | 심각도 | 파일 | 이슈 | 수정 내용 |
|---|--------|------|------|-----------|
| B-01 | 🔴 High | `app/page.tsx` | `useEffect` 의존성 배열에 `loadProjects`, `loadTasks` 누락 → 무한 렌더링 또는 stale data 가능 | 의존성 추가 + `setSelectedProjectId`를 functional update로 변경하여 stale closure 해결 |
| B-02 | 🟡 Medium | `components/TaskCard.tsx` | `new Date("YYYY-MM-DD")` → UTC 기준으로 파싱되어 KST 기준 날짜가 하루 밀림 | 날짜 문자열을 수동 파싱하여 로컬 타임존 Date 생성 |
| B-03 | 🟡 Medium | `app/api/tasks/route.ts` | Task 생성 시 status/priority 값 유효성 검증 없음 → 잘못된 값이 DB에 저장 가능 | `validStatuses`, `validPriorities` 화이트리스트 검증 추가 |
| B-04 | 🟢 Low | `app/page.tsx` | `loadProjects`의 `selectedProjectId` 의존성으로 불필요한 재생성 | `useCallback` 의존성을 빈 배열로 변경 + functional setState 사용 |

### ✅ 코드 품질 확인

| 항목 | 상태 | 비고 |
|------|------|------|
| TypeScript strict mode | ✅ | `tsconfig.json`에 `strict: true` |
| 타입 안전성 | ✅ | API 응답, 컴포넌트 props 모두 타입 정의 |
| SQL Injection 방지 | ✅ | Prisma ORM 사용 (파라미터 바인딩) |
| XSS 방지 | ✅ | React 자동 이스케이핑 |
| API 에러 핸들링 | ✅ | 모든 엔드포인트 try-catch + 적절한 HTTP 상태 코드 |
| Optimistic UI | ✅ | 드래그 시 즉시 반영 + 에러 시 롤백 |
| 접근성 | ⚠️ | ARIA 라벨 추가 필요 (Post-MVP) |
| 반응형 디자인 | ⚠️ | 모바일 사이드바 토글은 있으나 세부 조정 필요 |

---

## 2. 단위 테스트 (Unit Tests)

### 실행 방법
```bash
npm test              # 전체 테스트 실행
npm run test:watch    # 변경 감지 모드
npm run test:coverage # 커버리지 리포트
```

### 테스트 파일 목록

| 파일 | 테스트 수 | 대상 |
|------|----------|------|
| `__tests__/lib/types.test.ts` | 9 | 상수 & 타입 정합성 |
| `__tests__/lib/api.test.ts` | 11 | API 클라이언트 헬퍼 |
| `__tests__/api/projects.test.ts` | 8 | Projects API Route |
| `__tests__/api/tasks.test.ts` | 18 | Tasks API Route |
| `__tests__/components/TaskCard.test.tsx` | 12 | TaskCard 컴포넌트 |
| `__tests__/components/TaskModal.test.tsx` | 13 | TaskModal 컴포넌트 |
| **Total** | **71** | |

### 커버리지 목표

| 영역 | 목표 | 예상 |
|------|------|------|
| Branches | 70% | ~75% |
| Functions | 70% | ~80% |
| Lines | 70% | ~85% |
| Statements | 70% | ~85% |

---

## 3. 수동 테스트 체크리스트 (Manual QA)

### 3.1 프로젝트 관리

| # | 시나리오 | 기대 결과 | Pass/Fail |
|---|---------|-----------|-----------|
| M-01 | 사이드바에서 프로젝트 목록 확인 | 3개 샘플 프로젝트 표시 | ☐ |
| M-02 | 프로젝트 클릭하여 전환 | 선택된 프로젝트의 태스크만 표시 | ☐ |
| M-03 | 새 프로젝트 생성 (이름 + 색상) | 사이드바에 즉시 추가 | ☐ |
| M-04 | 빈 이름으로 프로젝트 생성 시도 | 생성 차단됨 | ☐ |
| M-05 | 프로젝트 전환 시 검색/필터 초기화 | 검색어, 필터 리셋됨 | ☐ |
| M-06 | 프로젝트별 미완료 태스크 카운트 | 사이드바 배지에 정확한 숫자 | ☐ |

### 3.2 할일 CRUD

| # | 시나리오 | 기대 결과 | Pass/Fail |
|---|---------|-----------|-----------|
| M-10 | 컬럼 `+` 버튼으로 할일 추가 | 모달 열림, 해당 컬럼에 추가 | ☐ |
| M-11 | 제목만 입력하여 추가 | 기본값 (보통, 상태=해당 컬럼) 적용 | ☐ |
| M-12 | 모든 필드 입력하여 추가 | 제목, 설명, 우선순위, 마감일, 상태 모두 반영 | ☐ |
| M-13 | 빈 제목으로 추가 시도 | 추가 차단됨 | ☐ |
| M-14 | Enter 키로 빠른 추가 | 모달에서 Enter → 추가 완료 | ☐ |
| M-15 | 카드 클릭하여 수정 모달 열기 | 기존 데이터 프리필 | ☐ |
| M-16 | 제목 수정 후 저장 | 카드에 변경사항 즉시 반영 | ☐ |
| M-17 | 우선순위 변경 후 저장 | 컬러바 & 배지 색상 변경 | ☐ |
| M-18 | 모달에서 삭제 버튼 클릭 | 카드 즉시 제거 | ☐ |
| M-19 | 모달 외부 클릭으로 닫기 | 변경사항 없이 모달 닫힘 | ☐ |

### 3.3 칸반 보드 & 드래그 앤 드롭

| # | 시나리오 | 기대 결과 | Pass/Fail |
|---|---------|-----------|-----------|
| M-20 | To Do → In Progress 드래그 | 카드가 In Progress 컬럼으로 이동 | ☐ |
| M-21 | In Progress → Done 드래그 | 카드가 Done으로 이동, 제목 취소선 | ☐ |
| M-22 | Done → To Do 드래그 (복구) | 카드가 To Do로 복구, 취소선 제거 | ☐ |
| M-23 | 드래그 중 시각적 피드백 | 카드 그림자 + 기울기, 컬럼 하이라이트 | ☐ |
| M-24 | 컬럼 위에 드롭 존 표시 | 점선 테두리 + 배경색 변경 | ☐ |
| M-25 | 같은 컬럼 내 드래그 취소 | 상태 변경 없음 | ☐ |
| M-26 | 빈 컬럼에 드롭 | 정상 이동 + 안내 텍스트 제거 | ☐ |

### 3.4 검색 & 필터

| # | 시나리오 | 기대 결과 | Pass/Fail |
|---|---------|-----------|-----------|
| M-30 | 검색창에 키워드 입력 | 실시간 필터링 (타이틀 매칭) | ☐ |
| M-31 | 대소문자 구분 없이 검색 | "prd" 검색 → "PRD 기획서" 표시 | ☐ |
| M-32 | 검색어 삭제 시 전체 표시 | 필터 해제, 모든 카드 복원 | ☐ |
| M-33 | "높음" 필터 클릭 | HIGH 우선순위만 표시 | ☐ |
| M-34 | "보통" 필터 클릭 | MEDIUM만 표시 | ☐ |
| M-35 | "전체" 필터 클릭 | 필터 해제 | ☐ |
| M-36 | 검색 + 필터 동시 적용 | 두 조건 모두 만족하는 카드만 표시 | ☐ |
| M-37 | 필터 결과 0건 | 빈 컬럼에 안내 메시지 | ☐ |

### 3.5 마감일 & 현황

| # | 시나리오 | 기대 결과 | Pass/Fail |
|---|---------|-----------|-----------|
| M-40 | 지난 마감일 표시 | 빨간색 "(지남)" 텍스트 | ☐ |
| M-41 | 오늘 마감일 표시 | 노란색 "(오늘)" 텍스트 | ☐ |
| M-42 | D-2 이내 마감일 | 노란색 "(D-N)" 텍스트 | ☐ |
| M-43 | 먼 미래 마감일 | 회색 "M/D" 형식 | ☐ |
| M-44 | 사이드바 진행률 바 | 완료 비율에 따른 바 길이 | ☐ |
| M-45 | 전체/완료/지연 통계 | 정확한 숫자 표시 | ☐ |

### 3.6 UI & UX

| # | 시나리오 | 기대 결과 | Pass/Fail |
|---|---------|-----------|-----------|
| M-50 | 사이드바 토글 | 사이드바 열기/닫기 애니메이션 | ☐ |
| M-51 | 카드 호버 | 그림자 증가 + 살짝 올라감 | ☐ |
| M-52 | 모달 열기 애니메이션 | 페이드인 + 스케일 애니메이션 | ☐ |
| M-53 | 카드 등장 애니메이션 | 순차적 슬라이드업 | ☐ |
| M-54 | 로딩 상태 | TaskFlow 로고 + pulse 애니메이션 | ☐ |
| M-55 | 스크롤바 커스텀 | 얇은 회색 스크롤바 | ☐ |

---

## 4. 크로스 브라우저 테스트

| 브라우저 | 버전 | 상태 | 비고 |
|---------|------|------|------|
| Chrome | 120+ | ☐ | 주요 타겟 |
| Safari | 17+ | ☐ | macOS/iOS |
| Firefox | 120+ | ☐ | |
| Edge | 120+ | ☐ | |
| Mobile Safari | iOS 17+ | ☐ | |
| Chrome Mobile | Android 14+ | ☐ | |

---

## 5. 성능 기준

| 항목 | 기준 | 측정 방법 |
|------|------|-----------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| API 응답 시간 | < 200ms | Network tab |
| 드래그 프레임 레이트 | > 30fps | Performance tab |
| 번들 크기 (gzipped) | < 200KB | `next build` |

---

## 6. 보안 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| SQL Injection 방지 | ✅ | Prisma ORM 파라미터 바인딩 |
| XSS 방지 | ✅ | React DOM 자동 이스케이핑 |
| CSRF | ⚠️ | MVP에서는 인증 없으므로 해당 없음, Post-MVP 대응 필요 |
| 입력값 유효성 검증 | ✅ | API Route에서 서버사이드 검증 |
| 에러 메시지 노출 제한 | ✅ | 내부 에러 로깅, 클라이언트에 일반 메시지만 반환 |
| Rate Limiting | ⚠️ | Post-MVP 대응 필요 |

---

## 7. 테스트 실행 가이드

```bash
# 1. 의존성 설치
npm install

# 2. 단위 테스트 실행
npm test

# 3. 커버리지 리포트 생성
npm run test:coverage

# 4. 수동 테스트 (개발 서버)
npx prisma db push
npm run db:seed
npm run dev
# → http://localhost:3000 에서 위 체크리스트 수행

# 5. Lighthouse 성능 측정
# Chrome DevTools > Lighthouse > Generate report
```

---

## 8. Known Issues (Post-MVP 개선사항)

| # | 우선순위 | 이슈 | 해결 방향 |
|---|---------|------|----------|
| K-01 | P1 | SQLite는 Vercel Serverless에서 write 불가 | Vercel Postgres 또는 Turso로 전환 |
| K-02 | P1 | 사용자 인증 없음 | NextAuth.js 적용 |
| K-03 | P2 | ARIA 라벨 부족 | 접근성 개선 패스 추가 |
| K-04 | P2 | 모바일 드래그앤드롭 지원 약함 | touch event 최적화 |
| K-05 | P2 | 칸반 보드 내 순서 재정렬 | 같은 컬럼 내 order 업데이트 로직 |
| K-06 | P3 | 다크모드 미지원 | CSS 변수 기반 테마 시스템 |
| K-07 | P3 | 오프라인 지원 없음 | Service Worker + IndexedDB |
