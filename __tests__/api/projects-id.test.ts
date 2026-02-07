/**
 * @jest-environment node
 *
 * Projects [id] API Route Test Suite
 * - GET/PUT/DELETE /api/projects/[id]
 * - 에러 케이스 처리
 */
import { GET, PUT, DELETE } from "@/app/api/projects/[id]/route";
import { NextRequest } from "next/server";

// Mock Prisma
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
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

describe("GET /api/projects/[id]", () => {
  it("should return a project with tasks", async () => {
    const mockProject = {
      id: "p1",
      name: "Test Project",
      description: "desc",
      color: "#6366F1",
      tasks: [{ id: "t1", title: "Task 1", order: 0 }],
    };
    mockFindUnique.mockResolvedValueOnce(mockProject);

    const req = new NextRequest("http://localhost/api/projects/p1");
    const response = await GET(req, makeParams("p1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("Test Project");
    expect(data.tasks).toHaveLength(1);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "p1" },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
  });

  it("should return 404 when project not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/projects/unknown");
    const response = await GET(req, makeParams("unknown"));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Not found");
  });

  it("should return 500 on database error", async () => {
    mockFindUnique.mockRejectedValueOnce(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/projects/p1");
    const response = await GET(req, makeParams("p1"));

    expect(response.status).toBe(500);
  });
});

describe("PUT /api/projects/[id]", () => {
  function makeRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/projects/p1", {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  it("should update a project", async () => {
    const updated = { id: "p1", name: "Updated", description: "new desc", color: "#EC4899" };
    mockUpdate.mockResolvedValueOnce(updated);

    const response = await PUT(
      makeRequest({ name: "Updated", description: "new desc", color: "#EC4899" }),
      makeParams("p1")
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("Updated");
  });

  it("should trim name whitespace", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "p1", name: "Trimmed" });

    await PUT(makeRequest({ name: "  Trimmed  " }), makeParams("p1"));

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({ name: "Trimmed" }),
    });
  });

  it("should set null description when empty", async () => {
    mockUpdate.mockResolvedValueOnce({ id: "p1", name: "Test" });

    await PUT(makeRequest({ name: "Test", description: "" }), makeParams("p1"));

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({ description: null }),
    });
  });

  it("should return 500 on database error", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("DB error"));

    const response = await PUT(makeRequest({ name: "Test" }), makeParams("p1"));

    expect(response.status).toBe(500);
  });
});

describe("DELETE /api/projects/[id]", () => {
  it("should delete a project", async () => {
    mockDelete.mockResolvedValueOnce({ id: "p1" });

    const req = new NextRequest("http://localhost/api/projects/p1", { method: "DELETE" });
    const response = await DELETE(req, makeParams("p1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });

  it("should return 500 on database error", async () => {
    mockDelete.mockRejectedValueOnce(new Error("DB error"));

    const req = new NextRequest("http://localhost/api/projects/p1", { method: "DELETE" });
    const response = await DELETE(req, makeParams("p1"));

    expect(response.status).toBe(500);
  });
});
