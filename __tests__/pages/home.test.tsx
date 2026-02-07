/**
 * Home Page (app/page.tsx) Test Suite
 * - 로딩 상태
 * - 프로젝트/태스크 데이터 로드
 * - 검색 필터링
 * - 우선순위 필터링
 * - 프로젝트 생성
 * - 모달 동작
 * - 사이드바 토글
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";

// Mock the API module
const mockFetchProjects = jest.fn();
const mockFetchTasks = jest.fn();
const mockCreateProject = jest.fn();
const mockCreateTask = jest.fn();
const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();

jest.mock("@/lib/api", () => ({
  fetchProjects: (...args: unknown[]) => mockFetchProjects(...args),
  fetchTasks: (...args: unknown[]) => mockFetchTasks(...args),
  createProject: (...args: unknown[]) => mockCreateProject(...args),
  createTask: (...args: unknown[]) => mockCreateTask(...args),
  updateTask: (...args: unknown[]) => mockUpdateTask(...args),
  deleteTask: (...args: unknown[]) => mockDeleteTask(...args),
}));

const mockProjects = [
  {
    id: "p1",
    name: "Test Project",
    description: "A test project",
    color: "#6366F1",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
    taskCount: 3,
    activeCount: 2,
    doneCount: 1,
  },
];

const mockTasks = [
  {
    id: "t1",
    title: "Todo Task",
    description: "A todo",
    status: "TODO",
    priority: "HIGH",
    dueDate: null,
    order: 0,
    projectId: "p1",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
  },
  {
    id: "t2",
    title: "In Progress Task",
    description: null,
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: null,
    order: 0,
    projectId: "p1",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
  },
  {
    id: "t3",
    title: "Done Task",
    description: null,
    status: "DONE",
    priority: "LOW",
    dueDate: null,
    order: 0,
    projectId: "p1",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchProjects.mockResolvedValue(mockProjects);
  mockFetchTasks.mockResolvedValue(mockTasks);
});

async function renderAndWaitForLoad() {
  render(<Home />);
  await waitFor(() => {
    expect(screen.getByText("Todo Task")).toBeInTheDocument();
  });
}

describe("Home Page", () => {
  describe("Loading State", () => {
    it("should show loading indicator initially", () => {
      mockFetchProjects.mockReturnValue(new Promise(() => {})); // never resolves
      render(<Home />);

      expect(screen.getByText("Loading TaskFlow...")).toBeInTheDocument();
    });
  });

  describe("Data Loading", () => {
    it("should load and display project name", async () => {
      await renderAndWaitForLoad();

      // Project name appears in both sidebar and main header
      const projectNames = screen.getAllByText("Test Project");
      expect(projectNames.length).toBeGreaterThanOrEqual(1);
    });

    it("should load and display tasks in columns", async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText("Todo Task")).toBeInTheDocument();
      expect(screen.getByText("In Progress Task")).toBeInTheDocument();
      expect(screen.getByText("Done Task")).toBeInTheDocument();
    });

    it("should display all three kanban columns", async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("should show TaskFlow branding", async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText("TaskFlow")).toBeInTheDocument();
    });

    it("should call fetchProjects on mount", async () => {
      await renderAndWaitForLoad();

      expect(mockFetchProjects).toHaveBeenCalled();
    });

    it("should call fetchTasks with selected project id", async () => {
      await renderAndWaitForLoad();

      expect(mockFetchTasks).toHaveBeenCalledWith("p1");
    });
  });

  describe("Search Filtering", () => {
    it("should filter tasks by search query", async () => {
      await renderAndWaitForLoad();

      const searchInput = screen.getByPlaceholderText("할일 검색...");
      await userEvent.type(searchInput, "Todo");

      expect(screen.getByText("Todo Task")).toBeInTheDocument();
      expect(screen.queryByText("In Progress Task")).not.toBeInTheDocument();
      expect(screen.queryByText("Done Task")).not.toBeInTheDocument();
    });

    it("should be case insensitive search", async () => {
      await renderAndWaitForLoad();

      const searchInput = screen.getByPlaceholderText("할일 검색...");
      await userEvent.type(searchInput, "todo");

      expect(screen.getByText("Todo Task")).toBeInTheDocument();
    });
  });

  describe("Priority Filtering", () => {
    it("should filter tasks by HIGH priority", async () => {
      await renderAndWaitForLoad();

      // Use getByRole to target the filter button, not the task badge
      await userEvent.click(screen.getByRole("button", { name: "높음" }));

      expect(screen.getByText("Todo Task")).toBeInTheDocument(); // HIGH
      expect(screen.queryByText("In Progress Task")).not.toBeInTheDocument(); // MEDIUM
      expect(screen.queryByText("Done Task")).not.toBeInTheDocument(); // LOW
    });

    it("should show all tasks when 전체 filter is clicked", async () => {
      await renderAndWaitForLoad();

      // First filter to HIGH
      await userEvent.click(screen.getByRole("button", { name: "높음" }));
      // Then click 전체 to reset
      await userEvent.click(screen.getByRole("button", { name: "전체" }));

      expect(screen.getByText("Todo Task")).toBeInTheDocument();
      expect(screen.getByText("In Progress Task")).toBeInTheDocument();
      expect(screen.getByText("Done Task")).toBeInTheDocument();
    });
  });

  describe("Add Task Modal", () => {
    it("should open add modal when + button in column is clicked", async () => {
      await renderAndWaitForLoad();

      // Click the first + button in a kanban column
      const addButtons = screen.getAllByText("+");
      // The first + is sidebar, the column + buttons follow
      await userEvent.click(addButtons[1]);

      expect(screen.getByText("새 할일 추가")).toBeInTheDocument();
    });

    it("should close modal when 취소 is clicked", async () => {
      await renderAndWaitForLoad();

      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[1]);

      expect(screen.getByText("새 할일 추가")).toBeInTheDocument();

      await userEvent.click(screen.getByText("취소"));

      expect(screen.queryByText("새 할일 추가")).not.toBeInTheDocument();
    });
  });

  describe("Edit Task Modal", () => {
    it("should open edit modal when task is clicked", async () => {
      await renderAndWaitForLoad();

      await userEvent.click(screen.getByText("Todo Task"));

      expect(screen.getByText("할일 수정")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Todo Task")).toBeInTheDocument();
    });
  });

  describe("Project Description", () => {
    it("should show project description when available", async () => {
      await renderAndWaitForLoad();

      expect(screen.getByText("A test project")).toBeInTheDocument();
    });

    it("should not show description when project has none", async () => {
      mockFetchProjects.mockResolvedValue([
        { ...mockProjects[0], description: null },
      ]);

      render(<Home />);
      await waitFor(() => {
        expect(screen.getByText("Todo Task")).toBeInTheDocument();
      });

      expect(screen.queryByText("A test project")).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle fetchProjects error gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockFetchProjects.mockRejectedValueOnce(new Error("Network error"));

      render(<Home />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
