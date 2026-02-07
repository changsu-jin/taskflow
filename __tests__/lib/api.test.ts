/**
 * API Client Helper Test Suite
 * - fetch 호출 검증
 * - 에러 핸들링 테스트
 * - 요청 파라미터 검증
 */
import * as api from "@/lib/api";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("API Client - Projects", () => {
  describe("fetchProjects", () => {
    it("should call GET /api/projects", async () => {
      const mockProjects = [
        { id: "p1", name: "Test Project", color: "#6366F1" },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProjects),
      });

      const result = await api.fetchProjects();

      expect(mockFetch).toHaveBeenCalledWith("/api/projects");
      expect(result).toEqual(mockProjects);
    });

    it("should throw on fetch failure", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(api.fetchProjects()).rejects.toThrow("Failed to fetch projects");
    });
  });

  describe("createProject", () => {
    it("should call POST /api/projects with data", async () => {
      const input = { name: "New Project", color: "#EC4899" };
      const mockResult = { id: "p2", ...input };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await api.createProject(input);

      expect(mockFetch).toHaveBeenCalledWith("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      expect(result).toEqual(mockResult);
    });

    it("should throw on creation failure", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

      await expect(
        api.createProject({ name: "" })
      ).rejects.toThrow("Failed to create project");
    });
  });

  describe("updateProject", () => {
    it("should call PUT /api/projects/:id", async () => {
      const mockResult = { id: "p1", name: "Updated", color: "#10B981" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await api.updateProject("p1", { name: "Updated" });

      expect(mockFetch).toHaveBeenCalledWith("/api/projects/p1", expect.objectContaining({
        method: "PUT",
      }));
      expect(result.name).toBe("Updated");
    });
  });

  describe("deleteProject", () => {
    it("should call DELETE /api/projects/:id", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await api.deleteProject("p1");

      expect(mockFetch).toHaveBeenCalledWith("/api/projects/p1", { method: "DELETE" });
    });
  });
});

describe("API Client - Tasks", () => {
  describe("fetchTasks", () => {
    it("should call GET /api/tasks with projectId", async () => {
      const mockTasks = [{ id: "t1", title: "Test Task", status: "TODO" }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      });

      const result = await api.fetchTasks("p1");

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks?projectId=p1");
      expect(result).toEqual(mockTasks);
    });
  });

  describe("createTask", () => {
    it("should call POST /api/tasks with all fields", async () => {
      const input = {
        title: "New Task",
        description: "Desc",
        status: "TODO",
        priority: "HIGH",
        dueDate: "2026-02-15",
        projectId: "p1",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "t2", ...input }),
      });

      const result = await api.createTask(input);

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks", expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
      }));
      expect(result.title).toBe("New Task");
    });

    it("should throw on missing title", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

      await expect(
        api.createTask({ title: "", projectId: "p1" })
      ).rejects.toThrow("Failed to create task");
    });
  });

  describe("updateTask", () => {
    it("should call PUT /api/tasks/:id with partial data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "t1", status: "DONE" }),
      });

      const result = await api.updateTask("t1", { status: "DONE" });

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks/t1", expect.objectContaining({
        method: "PUT",
      }));
      expect(result.status).toBe("DONE");
    });
  });

  describe("deleteTask", () => {
    it("should call DELETE /api/tasks/:id", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await api.deleteTask("t1");

      expect(mockFetch).toHaveBeenCalledWith("/api/tasks/t1", { method: "DELETE" });
    });

    it("should throw on delete failure", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(api.deleteTask("nonexistent")).rejects.toThrow("Failed to delete task");
    });
  });
});
