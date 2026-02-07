/**
 * Tasks API Route Test Suite
 * - CRUD 엔드포인트 테스트
 * - 필터링 & 검색 테스트
 * - 유효성 검증 테스트
 * - 드래그 상태변경 테스트
 */
import { GET, POST } from "@/app/api/tasks/route";
import { NextRequest } from "next/server";

// Mock Prisma
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockAggregate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      aggregate: (...args: unknown[]) => mockAggregate(...args),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/tasks", () => {
  function makeRequest(params: Record<string, string> = {}) {
    const url = new URL("http://localhost/api/tasks");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return new NextRequest(url);
  }

  it("should return tasks filtered by projectId", async () => {
    const mockTasks = [
      { id: "t1", title: "Task 1", status: "TODO", projectId: "p1" },
      { id: "t2", title: "Task 2", status: "DONE", projectId: "p1" },
    ];
    mockFindMany.mockResolvedValueOnce(mockTasks);

    const response = await GET(makeRequest({ projectId: "p1" }));
    const data = await response.json();

    expect(data).toHaveLength(2);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ projectId: "p1" }),
      })
    );
  });

  it("should filter by status", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await GET(makeRequest({ projectId: "p1", status: "TODO" }));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ projectId: "p1", status: "TODO" }),
      })
    );
  });

  it("should filter by priority", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await GET(makeRequest({ projectId: "p1", priority: "HIGH" }));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ priority: "HIGH" }),
      })
    );
  });

  it("should search by title", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await GET(makeRequest({ search: "test" }));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ title: { contains: "test" } }),
      })
    );
  });

  it("should apply multiple filters simultaneously", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await GET(makeRequest({ projectId: "p1", status: "TODO", priority: "HIGH" }));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { projectId: "p1", status: "TODO", priority: "HIGH" },
      })
    );
  });

  it("should order by order asc, then createdAt desc", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await GET(makeRequest({}));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
    );
  });

  it("should return 500 on database error", async () => {
    mockFindMany.mockRejectedValueOnce(new Error("DB error"));

    const response = await GET(makeRequest({}));

    expect(response.status).toBe(500);
  });
});

describe("POST /api/tasks", () => {
  function makeRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  it("should create a task with valid data", async () => {
    mockAggregate.mockResolvedValueOnce({ _max: { order: 2 } });
    mockCreate.mockResolvedValueOnce({
      id: "t1",
      title: "New Task",
      status: "TODO",
      priority: "HIGH",
      order: 3,
    });

    const response = await POST(
      makeRequest({
        title: "New Task",
        priority: "HIGH",
        projectId: "p1",
      })
    );
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.title).toBe("New Task");
  });

  it("should auto-increment order within column", async () => {
    mockAggregate.mockResolvedValueOnce({ _max: { order: 5 } });
    mockCreate.mockResolvedValueOnce({ id: "t2", order: 6 });

    await POST(makeRequest({ title: "Task", projectId: "p1" }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ order: 6 }),
      })
    );
  });

  it("should start order at 0 when column is empty", async () => {
    mockAggregate.mockResolvedValueOnce({ _max: { order: null } });
    mockCreate.mockResolvedValueOnce({ id: "t3", order: 0 });

    await POST(makeRequest({ title: "First Task", projectId: "p1" }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ order: 0 }),
      })
    );
  });

  it("should default status to TODO", async () => {
    mockAggregate.mockResolvedValueOnce({ _max: { order: null } });
    mockCreate.mockResolvedValueOnce({ id: "t4" });

    await POST(makeRequest({ title: "Task", projectId: "p1" }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "TODO" }),
      })
    );
  });

  it("should default priority to MEDIUM", async () => {
    mockAggregate.mockResolvedValueOnce({ _max: { order: null } });
    mockCreate.mockResolvedValueOnce({ id: "t5" });

    await POST(makeRequest({ title: "Task", projectId: "p1" }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: "MEDIUM" }),
      })
    );
  });

  it("should parse dueDate as Date object", async () => {
    mockAggregate.mockResolvedValueOnce({ _max: { order: null } });
    mockCreate.mockResolvedValueOnce({ id: "t6" });

    await POST(
      makeRequest({ title: "Task", projectId: "p1", dueDate: "2026-02-15" })
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          dueDate: expect.any(Date),
        }),
      })
    );
  });

  it("should set null dueDate when not provided", async () => {
    mockAggregate.mockResolvedValueOnce({ _max: { order: null } });
    mockCreate.mockResolvedValueOnce({ id: "t7" });

    await POST(makeRequest({ title: "Task", projectId: "p1" }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dueDate: null }),
      })
    );
  });

  // Validation tests
  it("should return 400 when title is empty", async () => {
    const response = await POST(makeRequest({ title: "", projectId: "p1" }));
    expect(response.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("should return 400 when title is only whitespace", async () => {
    const response = await POST(makeRequest({ title: "   ", projectId: "p1" }));
    expect(response.status).toBe(400);
  });

  it("should return 400 when projectId is missing", async () => {
    const response = await POST(makeRequest({ title: "Task" }));
    expect(response.status).toBe(400);
  });

  it("should return 400 for invalid status value", async () => {
    const response = await POST(
      makeRequest({ title: "Task", projectId: "p1", status: "INVALID" })
    );
    expect(response.status).toBe(400);
  });

  it("should return 400 for invalid priority value", async () => {
    const response = await POST(
      makeRequest({ title: "Task", projectId: "p1", priority: "URGENT" })
    );
    expect(response.status).toBe(400);
  });

  it("should accept valid status values", async () => {
    for (const status of ["TODO", "IN_PROGRESS", "DONE"]) {
      mockAggregate.mockResolvedValueOnce({ _max: { order: null } });
      mockCreate.mockResolvedValueOnce({ id: `t-${status}` });

      const response = await POST(
        makeRequest({ title: "Task", projectId: "p1", status })
      );
      expect(response.status).toBe(201);
    }
  });

  it("should accept valid priority values", async () => {
    for (const priority of ["HIGH", "MEDIUM", "LOW"]) {
      mockAggregate.mockResolvedValueOnce({ _max: { order: null } });
      mockCreate.mockResolvedValueOnce({ id: `t-${priority}` });

      const response = await POST(
        makeRequest({ title: "Task", projectId: "p1", priority })
      );
      expect(response.status).toBe(201);
    }
  });
});
