/**
 * TaskModal Component Test Suite
 * - 추가/수정 모드 렌더링
 * - 폼 입력 & 유효성 검증
 * - 저장/삭제/닫기 동작
 */
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskModal from "@/components/TaskModal";
import { Task } from "@/lib/types";

const mockTask: Task = {
  id: "t1",
  title: "Existing Task",
  description: "Existing description",
  status: "IN_PROGRESS",
  priority: "HIGH",
  dueDate: "2026-02-15",
  order: 0,
  projectId: "p1",
  createdAt: "2026-02-07T00:00:00Z",
  updatedAt: "2026-02-07T00:00:00Z",
};

describe("TaskModal", () => {
  const mockOnSave = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Add Mode", () => {
    it("should render add mode title", () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      expect(screen.getByText("새 할일 추가")).toBeInTheDocument();
    });

    it("should have empty fields in add mode", () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      const titleInput = screen.getByPlaceholderText("할일 제목을 입력하세요");
      expect(titleInput).toHaveValue("");
    });

    it("should call onSave with form data", async () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      await userEvent.type(screen.getByPlaceholderText("할일 제목을 입력하세요"), "New Task");
      await userEvent.click(screen.getByText("추가하기"));

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          status: "TODO",
          priority: "MEDIUM", // default
        })
      );
    });

    it("should not call onSave with empty title", async () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      await userEvent.click(screen.getByText("추가하기"));

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should not show delete button in add mode", () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      expect(screen.queryByText("삭제")).not.toBeInTheDocument();
    });

    it("should call onClose when cancel is clicked", async () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      await userEvent.click(screen.getByText("취소"));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call onClose when overlay is clicked", async () => {
      const { container } = render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      // Click on the overlay (first div)
      const overlay = container.firstChild as HTMLElement;
      await userEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should submit on Enter key", async () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      const titleInput = screen.getByPlaceholderText("할일 제목을 입력하세요");
      await userEvent.type(titleInput, "Quick Task{Enter}");

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Quick Task" })
      );
    });
  });

  describe("Edit Mode", () => {
    it("should render edit mode title", () => {
      render(
        <TaskModal
          mode="edit"
          task={mockTask}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("할일 수정")).toBeInTheDocument();
    });

    it("should pre-fill form with task data", () => {
      render(
        <TaskModal
          mode="edit"
          task={mockTask}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByDisplayValue("Existing Task")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Existing description")).toBeInTheDocument();
    });

    it("should show delete button in edit mode", () => {
      render(
        <TaskModal
          mode="edit"
          task={mockTask}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("삭제")).toBeInTheDocument();
    });

    it("should call onDelete when delete button clicked", async () => {
      render(
        <TaskModal
          mode="edit"
          task={mockTask}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      );

      await userEvent.click(screen.getByText("삭제"));

      expect(mockOnDelete).toHaveBeenCalledWith("t1");
    });

    it("should call onSave with updated data", async () => {
      render(
        <TaskModal
          mode="edit"
          task={mockTask}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      );

      const titleInput = screen.getByDisplayValue("Existing Task");
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "Updated Task");
      await userEvent.click(screen.getByText("저장하기"));

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "t1",
          title: "Updated Task",
        })
      );
    });

    it("should show 저장하기 button text", () => {
      render(
        <TaskModal
          mode="edit"
          task={mockTask}
          onSave={mockOnSave}
          onDelete={mockOnDelete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("저장하기")).toBeInTheDocument();
    });
  });

  describe("Status Selection", () => {
    it("should have 3 status buttons", () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      expect(screen.getByText(/To Do/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress/)).toBeInTheDocument();
      expect(screen.getByText(/Done/)).toBeInTheDocument();
    });

    it("should change status when button clicked", async () => {
      render(
        <TaskModal mode="add" defaultStatus="TODO" onSave={mockOnSave} onClose={mockOnClose} />
      );

      await userEvent.type(screen.getByPlaceholderText("할일 제목을 입력하세요"), "Task");
      await userEvent.click(screen.getByText(/Done/));
      await userEvent.click(screen.getByText("추가하기"));

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ status: "DONE" })
      );
    });
  });
});
