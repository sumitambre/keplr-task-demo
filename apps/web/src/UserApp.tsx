
import { useState } from "react";
import { Dashboard } from "./components/user/Dashboard";
import { Expenses } from "./components/user/Expenses";
import { Profile } from "./components/user/Profile";
import { TaskInProgress } from "./components/user/TaskInProgress";
import { TaskComplete } from "./components/user/TaskComplete";
import { TaskPDFPreview } from "./components/user/TaskPDFPreview";
import TaskFormSimple from "./components/user/TaskFormSimple";
import { mockClients, mockTaskTypes } from "./database/mockData";
import { Button } from "@repo/ui/button";
import { Plus, DollarSign, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/tooltip";
import { cn } from "@repo/ui/utils";
import { Task, Expense, User } from "./App"; // This will need to be adjusted
import { mockTechnicianTasks } from "./database/mockData";

export type UserAppProps = {
  user: User;
  onLogout: () => void;
  // The rest of the props need to be connected to a proper state management solution
  // For now, we'll use mock data and functions.
};

// Mock data and functions for standalone operation
const mockTasks: Task[] = (mockTechnicianTasks as unknown) as Task[];
const mockExpenses: Expense[] = [];

export function UserApp({ user, onLogout }: UserAppProps) {
  const [tasks, setTasks] = useState(mockTasks);
  const [expenses, setExpenses] = useState(mockExpenses);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentScreen, setCurrentScreen] = useState("dashboard");

  const onStartTask = (task: Task) => { setCurrentScreen('taskForm'); setSelectedTask(task); };
  const onContinueTask = (task: Task) => { setCurrentScreen('taskForm'); setSelectedTask(task); };
  const onCompleteTask = (task: Task) => { setCurrentScreen('taskForm'); setSelectedTask(task); };
  const onReviewTask = (task: Task) => { setCurrentScreen('taskPDF'); setSelectedTask(task); };
  const onReopenTask = (task: Task) => { /* Logic to reopen task */ };
  const onRequestCreateTask = () => { /* Logic to create task */ };
  const onRequestEditTask = (task: Task) => { /* Deprecated in card: no menu */ };
  const onDeleteTask = (taskId: string) => { /* Deprecated in card: no menu */ };
  const onAddExpense = (expense: Omit<Expense, "id">) => { };
  const onSaveTask = (updatedTask: Task) => { };
  const onTaskCompleted = (completedTask: Task) => { };


  const renderContent = () => {
    if (currentScreen === "taskInProgress" && selectedTask) {
      return (
        <TaskInProgress
          task={selectedTask}
          onSave={onSaveTask}
          onComplete={() => onCompleteTask(selectedTask)}
          onBack={() => setCurrentScreen("dashboard")}
        />
      );
    }

    if (currentScreen === "taskComplete" && selectedTask) {
      return (
        <TaskComplete
          task={selectedTask}
          onComplete={onTaskCompleted}
          onBack={() => setCurrentScreen("dashboard")}
        />
      );
    }

    if (currentScreen === "taskPDF" && selectedTask) {
      return <TaskPDFPreview task={selectedTask} onBack={() => setCurrentScreen("dashboard")} />;
    }

    switch (currentScreen) {
      case "expenses":
        return (
          <Expenses
            expenses={expenses}
            tasks={tasks}
            onAddExpense={onAddExpense}
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "profile":
        return (
          <Profile
            user={user}
            onLogout={onLogout}
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "taskForm":
        if (!selectedTask) return null;
        return (
          <TaskFormSimple
            value={selectedTask as any}
            onChange={(next) => setSelectedTask(next as any)}
            onBack={() => setCurrentScreen("dashboard")}
            onComplete={(report) => { setSelectedTask(report); setCurrentScreen("taskPDF"); }}
            dataSources={{
              clients: mockClients.map((c) => c.name),
              sites: mockClients.flatMap((c) => (c.sites || []).map((s: any) => s.name)),
              taskTypes: mockTaskTypes.map((t) => t.name),
            }}
          />
        );
      default:
        return (
          <Dashboard
            user={user}
            tasks={tasks}
            onStartTask={onStartTask}
            onContinueTask={onContinueTask}
            onCompleteTask={onCompleteTask}
            onNavigate={setCurrentScreen}
            onRequestCreateTask={onRequestCreateTask}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {currentScreen === "dashboard" && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Expenses"
            onClick={() => setCurrentScreen("expenses")}
          >
            <DollarSign className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Settings"
            onClick={() => setCurrentScreen("profile")}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      )}

      {currentScreen === "dashboard" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => onRequestCreateTask()}
              size="icon"
              className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-transform hover:scale-105"
              aria-label="Create New Task"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Create New Task</TooltipContent>
        </Tooltip>
      )}

      <div className="flex-1 min-w-0 overflow-auto">{renderContent()}</div>
    </div>
  );
}
