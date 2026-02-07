/**
 * Projects API Route Test Suite
 * - CRUD 엔드포인트 테스트
 * - 입력값 유효성 검증
 * - 에러 케이스 처리
 */
import { GET, POST } from "@/app/api/projects/route";
import { NextRequest } from "next/server";

// Mock Prisma
const mockFindMany = jest.fn();
const mockCreate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/projects", () => {
  it("should return list of projects with task counts", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        id: "p1",
        name: "Test Project",
        description: "desc",
        color: "#6366F1",
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { tasks: 3 },
        tasks: [
          { status: "TODO" },
          { status: "IN_PROGRESS" },
          { status: "DONE" },
        ],
      },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Test Project");
    expect(data[0].taskCount).toBe(3);
    expect(data[0].activeCount).toBe(2);
    expect(data[0].doneCount).toBe(1);
  });

  it("should return empty array when no projects", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const response = await GET();
    const data = await response.json();

    expect(data).toEqual([]);
  });

  it("should return 500 on database error", async () => {
    mockFindMany.mockRejectedValueOnce(new Error("DB error"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});

describe("POST /api/projects", () => {
  function makeRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("should create a project with valid data", async () => {
    const input = { name: "New Project", description: "Desc", color: "#EC4899" };
    mockCreate.mockResolvedValueOnce({ id: "p2", ...input });

    const response = await POST(makeRequest(input));
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe("New Project");
    expect(mockCreate).toHaveBeenCalledWith({
      data: { name: "New Project", description: "Desc", color: "#EC4899" },
    });
  });

  it("should trim whitespace from name", async () => {
    mockCreate.mockResolvedValueOnce({ id: "p3", name: "Trimmed" });

    await POST(makeRequest({ name: "  Trimmed  " }));

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "Trimmed" }),
    });
  });

  it("should use default color when not provided", async () => {
    mockCreate.mockResolvedValueOnce({ id: "p4", name: "NoColor" });

    await POST(makeRequest({ name: "NoColor" }));

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ color: "#6366F1" }),
    });
  });

  it("should return 400 when name is empty", async () => {
    const response = await POST(makeRequest({ name: "" }));

    expect(response.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should return 400 when name is only whitespace", async () => {
    const response = await POST(makeRequest({ name: "   " }));

    expect(response.status).toBe(400);
  });

  it("should return 400 when name is missing", async () => {
    const response = await POST(makeRequest({ description: "no name" }));

    expect(response.status).toBe(400);
  });

  it("should set null description when empty", async () => {
    mockCreate.mockResolvedValueOnce({ id: "p5", name: "Test" });

    await POST(makeRequest({ name: "Test", description: "" }));

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ description: null }),
    });
  });
});
