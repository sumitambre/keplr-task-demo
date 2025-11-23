
import { useState, useEffect } from "react";
import { Dashboard } from "./components/user/Dashboard";
import { Expenses } from "./components/user/Expenses";
import { Profile } from "./components/user/Profile";
import { TaskInProgress } from "./components/user/TaskInProgress";
import { TaskComplete } from "./components/user/TaskComplete";
import { TaskPDFPreview } from "./components/user/TaskPDFPreview";
import TaskFormSimple from "./components/user/TaskFormSimple";
import { mockClients, mockTaskTypes } from "./database/mockData";
import { Button } from "@repo/ui/button";
import { DollarSign, Settings } from "lucide-react";
import type { Task, Expense, User } from "./types"; // Type-only import
import { FloatingAddButton } from "./components/user/FloatingAddButton";
export type UserAppProps = {
  user: User;
  onLogout: () => void;
  // The rest of the props need to be connected to a proper state management solution
  // For now, we'll use mock data and functions.
};

// Get API URL from environment variable
const API_URL = ((import.meta as any)?.env?.VITE_API_URL as string | undefined) ?? '';

export function UserApp({ user, onLogout }: UserAppProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Fetch tasks from API when component mounts or when returning to dashboard
  useEffect(() => {
    const fetchTasks = async () => {
      // Only fetch if we are on the dashboard to save resources
      // (Or on initial load)
      if (currentScreen !== 'dashboard' && tasks.length > 0) return;

      try {
        setLoading(true);
        const base = API_URL?.replace(/\/$/, '') || '';

        // Fetch all tasks assigned to this user
        // We need to match user.username to the user in the database to get their ID
        // For now, let's fetch all users to find the user ID
        const usersResponse = await fetch(`${base}/api/users`);
        const users = await usersResponse.json();

        // Find the current user by username
        const currentUser = users.find((u: any) => u.username === user.username);

        if (currentUser) {
          // Fetch tasks assigned to this user with cache busting
          const tasksResponse = await fetch(`${base}/api/tasks?assignedUserId=${currentUser.id}&_t=${Date.now()}`);
          const tasksData = await tasksResponse.json();

          // Convert API task format to frontend Task format
          const convertedTasks: Task[] = tasksData.map((apiTask: any) => ({
            id: apiTask.id.toString(),
            clientName: apiTask.client,
            client: apiTask.client,  // For TaskFormSimple
            title: apiTask.title,
            onsiteContactName: apiTask.onsiteContactName || apiTask.contactName || '', // Map contact name
            contactNumber: apiTask.contactNumber || apiTask.phone || '', // Map contact number
            scheduledDate: apiTask.scheduledDate,
            status: apiTask.status as any,
            startTime: apiTask.startTime,
            endTime: apiTask.endTime,
            remarks: apiTask.remarks || apiTask.description,
            priority: apiTask.priority as any,
            siteName: apiTask.clientSite,
            clientSite: apiTask.clientSite,  // For TaskFormSimple
            taskType: apiTask.taskType,  // For TaskFormSimple
            siteMapUrl: apiTask.siteMapUrl,
            // Include session tracking data
            sessions: apiTask.sessions || [],
            beforePhotos: apiTask.beforePhotos || [],
            afterPhotos: apiTask.afterPhotos || [],
            signature: apiTask.signature || null,
            ack: apiTask.ack || null,
          }));


          setTasks(convertedTasks);
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        // If API fails, tasks will remain empty array
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user.username, currentScreen]); // Refetch when user or screen changes

  const onStartTask = (task: Task) => { setCurrentScreen('taskForm'); setSelectedTask(task); };
  const onContinueTask = (task: Task) => { setCurrentScreen('taskForm'); setSelectedTask(task); };
  const onCompleteTask = (task: Task) => { setCurrentScreen('taskForm'); setSelectedTask(task); };
  const onReviewTask = (task: Task) => { setCurrentScreen('taskPDF'); setSelectedTask(task); };
  const onReopenTask = (task: Task) => { /* Logic to reopen task */ };
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
            onReviewTask={onReviewTask}
            onNavigate={setCurrentScreen}
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

      {/* FloatingAddButton for creating new tasks */}
      {currentScreen === "dashboard" && <FloatingAddButton />}

      <div className="flex-1 min-w-0 overflow-auto">{renderContent()}</div>
    </div>
  );
}
