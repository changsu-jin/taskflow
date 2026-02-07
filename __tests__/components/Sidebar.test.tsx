/**
 * Sidebar Component Test Suite
 * - 프로젝트 목록 렌더링
 * - 선택 하이라이트
 * - 생성 폼 토글/입력/제출/유효성 검증
 * - 통계 표시
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "@/components/Sidebar";
import { Project } from "@/lib/types";

const mockProjects: Project[] = [
  {
    id: "p1",
    name: "Project Alpha",
    description: "First project",
    color: "#6366F1",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
    activeCount: 3,
  },
  {
    id: "p2",
    name: "Project Beta",
    description: null,
    color: "#EC4899",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
    activeCount: 0,
  },
];

const defaultStats = { total: 10, done: 4, overdue: 2 };

describe("Sidebar", () => {
  const mockOnSelect = jest.fn();
  const mockOnCreateProject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderSidebar(overrides: Record<string, unknown> = {}) {
    const props = {
      projects: mockProjects,
      selectedId: "p1",
      onSelect: mockOnSelect,
      onCreateProject: mockOnCreateProject,
      isOpen: true,
      stats: defaultStats,
      ...overrides,
    };
    return render(<Sidebar {...props} />);
  }

  describe("Project List", () => {
    it("should render project names", () => {
      renderSidebar();

      expect(screen.getByText("Project Alpha")).toBeInTheDocument();
      expect(screen.getByText("Project Beta")).toBeInTheDocument();
    });

    it("should show active count badge for projects with active tasks", () => {
      renderSidebar();

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should not show badge for projects with 0 active tasks", () => {
      renderSidebar({ projects: [mockProjects[1]] });

      // Project Beta has activeCount: 0, should not show badge
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("should call onSelect when project is clicked", async () => {
      renderSidebar();

      await userEvent.click(screen.getByText("Project Beta"));

      expect(mockOnSelect).toHaveBeenCalledWith("p2");
    });

    it("should show Projects header", () => {
      renderSidebar();

      expect(screen.getByText("Projects")).toBeInTheDocument();
    });
  });

  describe("Create Project Form", () => {
    it("should not show form initially", () => {
      renderSidebar();

      expect(screen.queryByPlaceholderText("프로젝트 이름")).not.toBeInTheDocument();
    });

    it("should show form when + button is clicked", async () => {
      renderSidebar();

      // Click the + button in the header area
      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[0]);

      expect(screen.getByPlaceholderText("프로젝트 이름")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("설명 (선택)")).toBeInTheDocument();
    });

    it("should call onCreateProject on submit", async () => {
      renderSidebar();

      // Open form
      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[0]);

      // Fill name
      await userEvent.type(screen.getByPlaceholderText("프로젝트 이름"), "New Project");
      // Click 생성
      await userEvent.click(screen.getByText("생성"));

      expect(mockOnCreateProject).toHaveBeenCalledWith({
        name: "New Project",
        color: "#6366F1", // default first color
      });
    });

    it("should not submit with empty name", async () => {
      renderSidebar();

      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[0]);

      await userEvent.click(screen.getByText("생성"));

      expect(mockOnCreateProject).not.toHaveBeenCalled();
    });

    it("should close form when 취소 is clicked", async () => {
      renderSidebar();

      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[0]);

      expect(screen.getByPlaceholderText("프로젝트 이름")).toBeInTheDocument();

      await userEvent.click(screen.getByText("취소"));

      expect(screen.queryByPlaceholderText("프로젝트 이름")).not.toBeInTheDocument();
    });

    it("should submit on Enter key", async () => {
      renderSidebar();

      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[0]);

      const nameInput = screen.getByPlaceholderText("프로젝트 이름");
      await userEvent.type(nameInput, "Enter Project{Enter}");

      expect(mockOnCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Enter Project" })
      );
    });

    it("should include description when provided", async () => {
      renderSidebar();

      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[0]);

      await userEvent.type(screen.getByPlaceholderText("프로젝트 이름"), "My Project");
      await userEvent.type(screen.getByPlaceholderText("설명 (선택)"), "A description");
      await userEvent.click(screen.getByText("생성"));

      expect(mockOnCreateProject).toHaveBeenCalledWith({
        name: "My Project",
        description: "A description",
        color: "#6366F1",
      });
    });

    it("should reset form after submission", async () => {
      renderSidebar();

      const addButtons = screen.getAllByText("+");
      await userEvent.click(addButtons[0]);

      await userEvent.type(screen.getByPlaceholderText("프로젝트 이름"), "New Project");
      await userEvent.click(screen.getByText("생성"));

      // Form should be hidden after submit
      expect(screen.queryByPlaceholderText("프로젝트 이름")).not.toBeInTheDocument();
    });
  });

  describe("Stats Footer", () => {
    it("should show progress percentage", () => {
      renderSidebar();

      // 4/10 = 40%
      expect(screen.getByText("40%")).toBeInTheDocument();
    });

    it("should show 0% when no tasks", () => {
      renderSidebar({ stats: { total: 0, done: 0, overdue: 0 } });

      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("should show stat values", () => {
      renderSidebar();

      expect(screen.getByText("10")).toBeInTheDocument(); // total
      expect(screen.getByText("4")).toBeInTheDocument();  // done
      expect(screen.getByText("2")).toBeInTheDocument();  // overdue
    });

    it("should show stat labels", () => {
      renderSidebar();

      expect(screen.getByText("전체")).toBeInTheDocument();
      expect(screen.getByText("완료")).toBeInTheDocument();
      expect(screen.getByText("지연")).toBeInTheDocument();
    });
  });
});
