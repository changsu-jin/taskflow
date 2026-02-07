/**
 * TaskCard Component Test Suite
 * - 렌더링 검증
 * - 우선순위 표시 테스트
 * - 마감일 표시 로직 테스트
 * - 드래그 가능 여부
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TaskCard from "@/components/TaskCard";
import { Task } from "@/lib/types";

// Wrapper for DnD context
function DnDWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

const baseTask: Task = {
  id: "t1",
  title: "Test Task",
  description: "Test description",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: null,
  order: 0,
  projectId: "p1",
  createdAt: "2026-02-07T00:00:00Z",
  updatedAt: "2026-02-07T00:00:00Z",
};

describe("TaskCard", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it("should render task title", () => {
    render(
      <DnDWrapper>
        <TaskCard task={baseTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("should render task description", () => {
    render(
      <DnDWrapper>
        <TaskCard task={baseTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should not render description when null", () => {
    const taskNoDesc = { ...baseTask, description: null };
    render(
      <DnDWrapper>
        <TaskCard task={taskNoDesc} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  it("should render priority badge", () => {
    render(
      <DnDWrapper>
        <TaskCard task={baseTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("보통")).toBeInTheDocument(); // MEDIUM = 보통
  });

  it("should render HIGH priority badge", () => {
    const highTask = { ...baseTask, priority: "HIGH" as const };
    render(
      <DnDWrapper>
        <TaskCard task={highTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("높음")).toBeInTheDocument();
  });

  it("should render LOW priority badge", () => {
    const lowTask = { ...baseTask, priority: "LOW" as const };
    render(
      <DnDWrapper>
        <TaskCard task={lowTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("낮음")).toBeInTheDocument();
  });

  it("should apply line-through for DONE tasks", () => {
    const doneTask = { ...baseTask, status: "DONE" as const };
    render(
      <DnDWrapper>
        <TaskCard task={doneTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    const titleEl = screen.getByText("Test Task");
    expect(titleEl).toHaveStyle({ textDecoration: "line-through" });
  });

  it("should not show line-through for TODO tasks", () => {
    render(
      <DnDWrapper>
        <TaskCard task={baseTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    const titleEl = screen.getByText("Test Task");
    expect(titleEl).toHaveStyle({ textDecoration: "none" });
  });

  it("should call onClick when card is clicked", async () => {
    render(
      <DnDWrapper>
        <TaskCard task={baseTask} index={0} onClick={mockOnClick} />
      </DnDWrapper>
    );

    await userEvent.click(screen.getByText("Test Task"));
    expect(mockOnClick).toHaveBeenCalledWith(baseTask);
  });

  describe("Due Date Display", () => {
    beforeEach(() => {
      // Fix "today" to 2026-02-07
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2026, 1, 7)); // Feb 7, 2026
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should show overdue indicator for past dates", () => {
      const overdueTask = { ...baseTask, dueDate: "2026-02-05T00:00:00Z" };
      render(
        <DnDWrapper>
          <TaskCard task={overdueTask} index={0} onClick={mockOnClick} />
        </DnDWrapper>
      );

      expect(screen.getByText(/지남/)).toBeInTheDocument();
    });

    it("should show today indicator", () => {
      const todayTask = { ...baseTask, dueDate: "2026-02-07T00:00:00Z" };
      render(
        <DnDWrapper>
          <TaskCard task={todayTask} index={0} onClick={mockOnClick} />
        </DnDWrapper>
      );

      expect(screen.getByText(/오늘/)).toBeInTheDocument();
    });

    it("should show D-N for upcoming dates within 2 days", () => {
      const soonTask = { ...baseTask, dueDate: "2026-02-09T00:00:00Z" };
      render(
        <DnDWrapper>
          <TaskCard task={soonTask} index={0} onClick={mockOnClick} />
        </DnDWrapper>
      );

      expect(screen.getByText(/D-2/)).toBeInTheDocument();
    });

    it("should show plain date for far future dates", () => {
      const futureTask = { ...baseTask, dueDate: "2026-03-15T00:00:00Z" };
      render(
        <DnDWrapper>
          <TaskCard task={futureTask} index={0} onClick={mockOnClick} />
        </DnDWrapper>
      );

      expect(screen.getByText("3/15")).toBeInTheDocument();
    });

    it("should not show date when dueDate is null", () => {
      render(
        <DnDWrapper>
          <TaskCard task={baseTask} index={0} onClick={mockOnClick} />
        </DnDWrapper>
      );

      expect(screen.queryByText(/\d\/\d/)).not.toBeInTheDocument();
    });
  });
});
