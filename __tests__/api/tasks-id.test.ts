/**
 * @jest-environment node
 *
 * Tasks [id] API Route Test Suite
 * - GET/PUT/DELETE /api/tasks/[id]
 * - 부분 업데이트 테스트
 * - dueDate 파싱 테스트
 */
import { GET, PUT, DELETE } from "@/app/api/tasks/[id]/route";
import { NextRequest } from "next/server";

// Mock Prisma
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const makeParams = (id: string) => ({ params: { id } });

describe("GET /api/tasks/[id]", () => {
  it("should return a task with project info", async () => {
    const mockTask = {
      id: "t1",
      title: "Test Task",
      status: "TODO",
      priority: "MEDIUM",
      project: { name: "Project 1", color: "#6366F1" },
    };
    mockFindUnique.mockResolvedValueOnce(mockTask);

    const req = new NextRequest("http://localhost/api/tasks/t1");
    const response = await GET(req, makeParams("t1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe("Test Task");
    expect(data.project.name).toBe("Project 1");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "t1" },
      include: { project: { select: { name: true, color: true } } },
    });
  });

  it("should return 404 when task not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/tasks/unknown");
    const response = await GET(req, makeParams("unknown"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
  });

  it("should return 500 on database error", async () => {
    mockFindUnique.mockRejectedValueOnce(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/tasks/t1");
    const response = await GET(req, makeParams("t1"));

    expect(response.status).toBe(500);
  });
});

describe("PUT /api/tasks/[id]", () => {
  function makeRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/tasks/t1", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  it("should update all fields", async () => {
    const updated = {
      id: "t1",
      title: "Updated",
      status: "DONE",
      priority: "HIGH",
      project: { name: "P1", color: "#6366F1" },
    };
    mockUpdate.mockResolvedValueOnce(updated);

    const response = await PUT(
      makeRequest({
        title: "Updated",
        description: "new desc",
        status: "DONE",
        priority: "HIGH",
        order: 2,
        dueDate: "2026-03-01",
      }),
      makeParams("t1")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe("Updated");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: {
        title: "Updated",
        description: "new desc",
        status: "DONE",
        priority: "HIGH",
        order: 2,
        dueDate: expect.any(Date),
      },
      include: { project: { select: { name: true, color: true } } },
    });
  });

  it("should update only status (partial update)", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "t1", status: "IN_PROGRESS" });

    await PUT(makeRequest({ status: "IN_PROGRESS" }), makeParams("t1"));

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "t1" },
      data: { status: "IN_PROGRESS" },
      include: { project: { select: { name: true, color: true } } },
    });
  });

  it("should parse dueDate as Date object", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "t1" });

    await PUT(makeRequest({ dueDate: "2026-02-15" }), makeParams("t1"));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { dueDate: expect.any(Date) },
      })
    );
  });

  it("should set null dueDate when empty string", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "t1" });

    await PUT(makeRequest({ dueDate: "" }), makeParams("t1"));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { dueDate: null },
      })
    );
  });

  it("should set null description when empty", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "t1" });

    await PUT(makeRequest({ description: "" }), makeParams("t1"));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { description: null },
      })
    );
  });

  it("should trim title whitespace", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "t1" });

    await PUT(makeRequest({ title: "  Trimmed  " }), makeParams("t1"));

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: "Trimmed" }),
      })
    );
  });

  it("should return 500 on database error", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("DB error"));

    const response = await PUT(makeRequest({ title: "Test" }), makeParams("t1"));

    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/tasks/[id]", () => {
  it("should delete a task", async () => {
    mockDelete.mockResolvedValueOnce({ id: "t1" });

    const req = new NextRequest("http://localhost/api/tasks/t1", { method: "DELETE" });
    const response = await DELETE(req, makeParams("t1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "t1" } });
  });

  it("should return 500 on database error", async () => {
    mockDelete.mockRejectedValueOnce(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/tasks/t1", { method: "DELETE" });
    const response = await DELETE(req, makeParams("t1"));

    expect(response.status).toBe(500);
  });
});
