/**
 * KanbanColumn Component Test Suite
 * - 헤더/카운트 렌더링
 * - 태스크 카드 렌더링
 * - 빈 상태 메시지
 * - 버튼 콜백
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import KanbanColumn from "@/components/KanbanColumn";
import { Task } from "@/lib/types";

// Wrap with DragDropContext since KanbanColumn uses Droppable
function DnDWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DragDropContext onDragEnd={() => {}}>
      {children}
    </DragDropContext>
  );
}

const baseTasks: Task[] = [
  {
    id: "t1",
    title: "First Task",
    description: "Description 1",
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
    title: "Second Task",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    order: 1,
    projectId: "p1",
    createdAt: "2026-02-07T00:00:00Z",
    updatedAt: "2026-02-07T00:00:00Z",
  },
];

describe("KanbanColumn", () => {
  const mockOnAddClick = jest.fn();
  const mockOnTaskClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render column header with status label", () => {
    render(
      <DnDWrapper>
        <KanbanColumn status="TODO" tasks={baseTasks} onAddClick={mockOnAddClick} onTaskClick={mockOnTaskClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("should render task count", () => {
    render(
      <DnDWrapper>
        <KanbanColumn status="TODO" tasks={baseTasks} onAddClick={mockOnAddClick} onTaskClick={mockOnTaskClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should render IN_PROGRESS column label", () => {
    render(
      <DnDWrapper>
        <KanbanColumn status="IN_PROGRESS" tasks={[]} onAddClick={mockOnAddClick} onTaskClick={mockOnTaskClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("should render task cards", () => {
    render(
      <DnDWrapper>
        <KanbanColumn status="TODO" tasks={baseTasks} onAddClick={mockOnAddClick} onTaskClick={mockOnTaskClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("First Task")).toBeInTheDocument();
    expect(screen.getByText("Second Task")).toBeInTheDocument();
  });

  it("should show empty state message when no tasks", () => {
    render(
      <DnDWrapper>
        <KanbanColumn status="DONE" tasks={[]} onAddClick={mockOnAddClick} onTaskClick={mockOnTaskClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("할일을 드래그하여 이동하세요")).toBeInTheDocument();
  });

  it("should call onAddClick with status when + button clicked", async () => {
    render(
      <DnDWrapper>
        <KanbanColumn status="TODO" tasks={[]} onAddClick={mockOnAddClick} onTaskClick={mockOnTaskClick} />
      </DnDWrapper>
    );

    await userEvent.click(screen.getByText("+"));

    expect(mockOnAddClick).toHaveBeenCalledWith("TODO");
  });

  it("should render count as 0 for empty tasks", () => {
    render(
      <DnDWrapper>
        <KanbanColumn status="DONE" tasks={[]} onAddClick={mockOnAddClick} onTaskClick={mockOnTaskClick} />
      </DnDWrapper>
    );

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
