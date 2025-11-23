import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui";
import {
  Eye,
  User,
  Clock,
  AlertTriangle,
  Trash2,
  Calendar,
  CalendarDays,
  CalendarX,
  ListTodo,
  CheckCircle2,
  Loader2,
  Pencil,
  Building2,
  MapPin,
  ClipboardList,
  FileText,
} from "lucide-react";
import { mockClients, statuses } from "../../database/mockData";
import { ResponsiveCardTable } from "./ResponsiveCardTable";
import { TaskDialog } from "./FloatingAddButton";
import { TaskPDFPreview } from "../user/TaskPDFPreview";

// Get API URL from environment variable
const API_URL = ((import.meta as any)?.env?.VITE_API_URL as string | undefined) ?? '';

export function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTask, setReportTask] = useState<any>(null);

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const base = API_URL?.replace(/\/$/, '') || '';

        // Fetch all data in parallel
        const [tasksRes, usersRes, clientsRes] = await Promise.all([
          fetch(`${base}/api/tasks`),
          fetch(`${base}/api/users`),
          fetch(`${base}/api/clients`)
        ]);

        const tasksData = await tasksRes.json();
        const usersData = await usersRes.json();
        const clientsData = await clientsRes.json();

        setTasks(tasksData);
        setUsers(usersData);
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Period + custom date range
  const [timePeriod, setTimePeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Quick filters
  const [filters, setFilters] = useState({
    user: "All",
    client: "All",
    status: "All",
    startDate: "",
    endDate: "",
  });

  const currentUser = users[0] || { username: 'Admin' };
  type KpiKey = "total" | "completed" | "inProgress" | "pending";
  const [selectedKPI, setSelectedKPI] = useState<KpiKey>("total");
  const applyCustomRange = () => setTimePeriod("custom");

  const getDateRange = () => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    switch (timePeriod) {
      case "today":
        return { start: todayStr, end: todayStr };
      case "yesterday": {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        const s = y.toISOString().split("T")[0];
        return { start: s, end: s };
      }
      case "7days": {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        return { start: d.toISOString().split("T")[0], end: todayStr };
      }
      case "month": {
        const m = new Date(today);
        m.setMonth(m.getMonth() - 1);
        return { start: m.toISOString().split("T")[0], end: todayStr };
      }
      case "year": {
        const y = new Date(today);
        y.setFullYear(y.getFullYear() - 1);
        return { start: y.toISOString().split("T")[0], end: todayStr };
      }
      case "custom":
        return { start: customStartDate, end: customEndDate };
      case "all":
      default:
        return { start: "", end: "" };
    }
  };

  // Apply filters
  const filteredTasks = useMemo(() => {
    const { start, end } = getDateRange();
    return tasks.filter((t) => {
      if (timePeriod !== "all") {
        if (start && t.dueDate < start) return false;
        if (end && t.dueDate > end) return false;
      }
      if (filters.user !== "All" && t.assignedTo !== filters.user) return false;
      if (filters.client !== "All" && t.client !== filters.client) return false;
      if (filters.status !== "All" && t.status !== filters.status) return false;
      if (filters.startDate && t.dueDate < filters.startDate) return false;
      if (filters.endDate && t.dueDate > filters.endDate) return false;
      return true;
    });
  }, [tasks, timePeriod, customStartDate, customEndDate, filters]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((t) => t.status === "Completed").length;
    const inProgress = filteredTasks.filter((t) => t.status === "In Progress").length;
    const pending = filteredTasks.filter((t) => t.status === "Pending").length;
    return { total, completed, inProgress, pending };
  }, [filteredTasks]);

  // Overdue
  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter(
      (t) => t.dueDate < today && t.status !== "Completed" && t.status !== "Cancelled",
    );
  }, [tasks]);

  const handleView = (task: any) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };
  const handleEdit = (task: any) => {
    setTaskToEdit(task);
    setIsEditOpen(true);
  };
  const handleViewReport = (task: any) => {
    setReportTask(task);
    setIsReportOpen(true);
  };
  const handleDelete = async (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const base = API_URL?.replace(/\/$/, '') || '';
        const response = await fetch(`${base}/api/tasks/${taskId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTasks(prev => prev.filter(t => t.id !== taskId));
          toast.success("Task deleted");
        } else {
          toast.error("Failed to delete task");
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error("Error deleting task");
      }
    }
  };

  const getTaskLocation = (task: any) => {
    if (task.siteMapUrl) return task.siteMapUrl;
    const client = mockClients.find((c) => c.name === task.client);
    if (!client) return null;

    if (task.clientSite) {
      const siteMatch = client.sites?.find((site) => site.name === task.clientSite);
      if (siteMatch?.googleMapsLink) return siteMatch.googleMapsLink;
    }

    return client.sites?.find((site) => site.googleMapsLink)?.googleMapsLink ?? null;
  };

  const handleClientLocationClick = (task: any) => {
    const link = getTaskLocation(task);
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No location saved for this client.");
    }
  };

  const getPriorityColor = (p: string) =>
    p === "Critical" || p === "High" ? "destructive" : p === "Low" ? "secondary" : "default";

  const getStatusColor = (s: string) =>
    s === "Pending" ? "secondary" : s === "On Hold" || s === "Cancelled" ? "destructive" : "default";

  const periodLabel =
    timePeriod === "today"
      ? "Today's Tasks"
      : timePeriod === "yesterday"
        ? "Yesterday's Tasks"
        : timePeriod === "7days"
          ? "Last 7 Days Tasks"
          : timePeriod === "month"
            ? "Last Month Tasks"
            : timePeriod === "year"
              ? "Last Year Tasks"
              : timePeriod === "custom"
                ? "Custom Period Tasks"
                : "All Tasks";

  return (
    <div className="min-h-screen w-full bg-background">
      {isReportOpen && reportTask ? (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <TaskPDFPreview task={reportTask} onBack={() => setIsReportOpen(false)} />
        </div>
      ) : null}
      <div className="border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Card className="border-none bg-transparent shadow-none">
            <CardContent className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentUser ? `Welcome, ${currentUser.username}` : "Welcome"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <Select value={timePeriod} onValueChange={setTimePeriod}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {timePeriod === "custom" && (
                <Card className="mb-4 rounded-xl border border-border shadow-sm">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button size="sm" onClick={applyCustomRange}>
                        Apply Range
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {overdueTasks.length > 0 && (
                <Card
                  className="mt-4 rounded-xl border border-border shadow-sm"
                  style={{ backgroundColor: "#FDE7E7" }}
                >
                  <div className="flex items-center gap-2 p-4 text-red-800">
                    <CalendarX className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      You have {overdueTasks.length} overdue task
                      {overdueTasks.length > 1 ? "s" : ""} that need attention.
                    </p>
                  </div>
                </Card>
              )}

              {(() => {
                const baseCard =
                  "rounded-xl border border-border bg-blur text-card-foreground shadow-sm transition-shadow hover:shadow-md cursor-pointer select-none data-[selected=true]:ring-2 data-[selected=true]:ring-primary/40";
                const baseInner = "flex items-center justify-between p-4 text-black";
                const titleCls = "flex items-center gap-2 text-sm font-medium text-black";
                const valueCls = "text-3xl font-semibold text-black";

                return (
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Card
                      data-selected={selectedKPI === "total" ? "true" : "false"}
                      onClick={() => setSelectedKPI("total")}
                      className={baseCard}
                      style={{ backgroundColor: "#E3F2FD", color: "black" }}
                    >
                      <div className={baseInner}>
                        <div className={titleCls}>
                          <ListTodo className="h-4 w-4 text-black" />
                          Total Tasks
                        </div>
                        <div className={valueCls}>{stats.total}</div>
                      </div>
                    </Card>

                    <Card
                      data-selected={selectedKPI === "completed" ? "true" : "false"}
                      onClick={() => setSelectedKPI("completed")}
                      className={baseCard}
                      style={{ backgroundColor: "#E8F5E9", color: "black" }}
                    >
                      <div className={baseInner}>
                        <div className={titleCls}>
                          <CheckCircle2 className="h-4 w-4 text-black" />
                          Completed
                        </div>
                        <div className={valueCls}>{stats.completed}</div>
                      </div>
                    </Card>

                    <Card
                      data-selected={selectedKPI === "inProgress" ? "true" : "false"}
                      onClick={() => setSelectedKPI("inProgress")}
                      className={baseCard}
                      style={{ backgroundColor: "#E3F2FD", color: "black" }}
                    >
                      <div className={baseInner}>
                        <div className={titleCls}>
                          <Loader2 className="h-4 w-4 text-black" />
                          In Progress
                        </div>
                        <div className={valueCls}>{stats.inProgress}</div>
                      </div>
                    </Card>

                    <Card
                      data-selected={selectedKPI === "pending" ? "true" : "false"}
                      onClick={() => setSelectedKPI("pending")}
                      className={baseCard}
                      style={{ backgroundColor: "#FFF3E0", color: "black" }}
                    >
                      <div className={baseInner}>
                        <div className={titleCls}>
                          <Clock className="h-4 w-4 text-black" />
                          Pending
                        </div>
                        <div className={valueCls}>{stats.pending}</div>
                      </div>
                    </Card>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-6 sm:px-6 lg:px-8">
        {/* Quick filters */}
        <Card className="mt-6 rounded-xl border border-border shadow-sm">
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-base font-semibold">Quick Filters</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 sm:p-6 sm:pt-3">
            <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3">
              {/* User */}
              <Select
                value={filters.user}
                onValueChange={(v) => setFilters({ ...filters, user: v })}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[150px] rounded-full border border-border bg-muted/40 text-sm sm:w-[180px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.name}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.client}
                onValueChange={(v) => setFilters({ ...filters, client: v })}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[150px] rounded-full border border-border bg-muted/40 text-sm sm:w-[180px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Clients</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[150px] rounded-full border border-border bg-muted/40 text-sm sm:w-[180px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-full sm:ml-auto"
                onClick={() =>
                  setFilters({
                    user: "All",
                    client: "All",
                    status: "All",
                    startDate: "",
                    endDate: "",
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks table */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle>{periodLabel}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No tasks found for the selected period.</p>
              </div>
            ) : (
              <ResponsiveCardTable
                table={
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="max-w-xs truncate">{task.title}</TableCell>
                            <TableCell>
                              <button
                                type="button"
                                onClick={() => handleClientLocationClick(task)}
                                className="rounded-sm text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40"
                              >
                                {task.client}
                              </button>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {task.assignedTo}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityColor(task.priority)}>
                                {task.priority === "Critical" && (
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                )}
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {task.dueDate}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleView(task)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {task.status === 'Completed' && (
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(task)} title="View Report">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => handleEdit(task)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                }
                cards={filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-foreground">{task.title}</h3>
                        <button
                          type="button"
                          onClick={() => handleClientLocationClick(task)}
                          className="mt-1 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
                        >
                          {task.client}
                        </button>
                        {task.clientSite && (
                          <p className="text-xs text-muted-foreground">{task.clientSite}</p>
                        )}
                        {task.taskType && (
                          <p className="text-xs text-muted-foreground">{task.taskType}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                          {task.priority === "Critical" && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {task.priority}
                        </Badge>
                        <Badge variant={getStatusColor(task.status)} className="capitalize">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-foreground font-medium">{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{task.dueDate}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handleView(task)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      {task.status === 'Completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={() => handleViewReport(task)}
                        >
                          <FileText className="h-4 w-4" />
                          Report
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => handleEdit(task)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 text-destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
                cardsClassName="space-y-4"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* View dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              Task Details
            </DialogTitle>
            <DialogDescription>
              {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6 py-4">
              {/* Status & Priority Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                    <Badge variant={getStatusColor(selectedTask.status)} className="w-fit px-3 py-1 text-sm">
                      {selectedTask.status}
                    </Badge>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
                    <Badge variant={getPriorityColor(selectedTask.priority)} className="w-fit px-3 py-1 text-sm">
                      {selectedTask.priority === "Critical" && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {selectedTask.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {selectedTask.dueDate}</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Client Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                    <Building2 className="h-4 w-4" /> Client Information
                  </h4>
                  <div className="rounded-md border p-3 space-y-3 bg-card">
                    <div>
                      <Label className="text-xs text-muted-foreground">Client Name</Label>
                      <p className="font-medium">{selectedTask.client}</p>
                    </div>
                    {selectedTask.clientSite && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Site Location</Label>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm">{selectedTask.clientSite}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                            onClick={() => handleClientLocationClick(selectedTask)}
                          >
                            <MapPin className="mr-1 h-3 w-3" />
                            Map
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <Label className="text-xs text-muted-foreground">Contact Name</Label>
                        <p className="text-sm font-medium">{selectedTask.contactName || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Contact Number</Label>
                        <p className="text-sm font-medium">{selectedTask.contactNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Assignment */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                    <User className="h-4 w-4" /> Assignment Details
                  </h4>
                  <div className="rounded-md border p-3 space-y-3 bg-card">
                    <div>
                      <Label className="text-xs text-muted-foreground">Assigned Technician</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{selectedTask.assignedTo}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Task Type</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className="font-normal">{selectedTask.taskType}</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Required Skill</Label>
                        <div className="mt-1">
                          <Badge variant="secondary" className="font-normal">{selectedTask.skillRequired}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                  <ClipboardList className="h-4 w-4" /> Description
                </h4>
                <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed border">
                  {selectedTask.description || <span className="text-muted-foreground italic">No description provided.</span>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => { setIsViewOpen(false); handleEdit(selectedTask); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <TaskDialog open={isEditOpen} onOpenChange={setIsEditOpen} taskToEdit={taskToEdit} />
    </div>
  );
}
