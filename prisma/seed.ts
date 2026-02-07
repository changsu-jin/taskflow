import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  // Create projects
  const p1 = await prisma.project.create({
    data: {
      name: "TaskFlow MVP",
      description: "프로젝트 관리 앱 개발",
      color: "#6366F1",
    },
  });

  const p2 = await prisma.project.create({
    data: {
      name: "블로그 리뉴얼",
      description: "개인 블로그 재설계",
      color: "#EC4899",
    },
  });

  const p3 = await prisma.project.create({
    data: {
      name: "독서 챌린지",
      description: "2026 독서 목표",
      color: "#10B981",
    },
  });

  // Create tasks for TaskFlow MVP
  const taskflowTasks = [
    { title: "PRD 기획서 작성", description: "제품 요구사항 정의서 완성", status: "DONE", priority: "HIGH", dueDate: new Date("2026-02-07"), order: 0 },
    { title: "디자인 시스템 정의", description: "컬러, 타이포, 컴포넌트 가이드", status: "DONE", priority: "HIGH", dueDate: new Date("2026-02-08"), order: 1 },
    { title: "와이어프레임 제작", description: "주요 화면 와이어프레임", status: "IN_PROGRESS", priority: "HIGH", dueDate: new Date("2026-02-08"), order: 0 },
    { title: "DB 스키마 설계", description: "Prisma 모델 정의", status: "TODO", priority: "HIGH", dueDate: new Date("2026-02-09"), order: 0 },
    { title: "API Routes 구현", description: "CRUD API 엔드포인트", status: "TODO", priority: "MEDIUM", dueDate: new Date("2026-02-10"), order: 1 },
    { title: "칸반 보드 UI", description: "드래그 앤 드롭 구현", status: "TODO", priority: "MEDIUM", dueDate: new Date("2026-02-12"), order: 2 },
    { title: "Vercel 배포", description: "프로덕션 환경 배포", status: "TODO", priority: "LOW", dueDate: new Date("2026-02-14"), order: 3 },
  ];

  for (const task of taskflowTasks) {
    await prisma.task.create({ data: { ...task, projectId: p1.id } });
  }

  // Create tasks for Blog
  await prisma.task.create({
    data: { title: "메인 페이지 디자인", description: "히어로 섹션, 포트폴리오", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: new Date("2026-02-15"), order: 0, projectId: p2.id },
  });
  await prisma.task.create({
    data: { title: "콘텐츠 마이그레이션", description: "기존 글 이전", status: "TODO", priority: "LOW", dueDate: new Date("2026-02-20"), order: 0, projectId: p2.id },
  });

  // Create tasks for Reading
  await prisma.task.create({
    data: { title: "2월 독서 목록 선정", description: "이번 달 읽을 책 3권", status: "DONE", priority: "MEDIUM", dueDate: new Date("2026-02-05"), order: 0, projectId: p3.id },
  });
  await prisma.task.create({
    data: { title: "독후감 작성", description: "첫 번째 책 독후감", status: "IN_PROGRESS", priority: "LOW", dueDate: new Date("2026-02-28"), order: 0, projectId: p3.id },
  });

  console.log("✅ Seed data created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
