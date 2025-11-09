import React, { useMemo, useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Alert, AlertDescription } from '@repo/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { TaskCard } from './TaskCard';
import type { Task, User } from '../App';
import { CalendarDays, ListTodo, CheckCircle2, Clock3, Hourglass } from 'lucide-react';

interface DashboardProps {
  user: User;
  tasks: Task[];
  onStartTask: (task: Task) => void;
  onContinueTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onNavigate: (screen: string) => void;
  onRequestCreateTask: (scheduledDate?: string) => void;
}

const toDateKey = (date: Date) => {
  const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return normalized.toISOString().slice(0, 10);
};

const formatDateLabel = (date: Date | null) => {
  if (!date) return 'All dates';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

type DateFilter =
  | { kind: 'all'; label?: string }
  | { kind: 'single'; date: Date; label?: string }
  | { kind: 'range'; from: Date; to: Date; label?: string };

const getDateFilterLabel = (filter: DateFilter): string => {
  if (filter.label) return filter.label;
  switch (filter.kind) {
    case 'all':
      return 'All dates';
    case 'single':
      return formatDateLabel(filter.date);
    case 'range': {
      const from = filter.from.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const to = filter.to.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${from} – ${to}`;
    }
  }
};

// Safe variant to avoid any encoding artifacts in labels
const getDateFilterLabelClean = (filter: DateFilter): string => {
  if (filter.label) return filter.label;
  if (filter.kind === 'all') return 'All dates';
  if (filter.kind === 'single') return formatDateLabel(filter.date);
  if (filter.kind === 'range') {
    const from = filter.from.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const to = filter.to.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${from} – ${to}`;
  }
  return 'All dates';
};

export function Dashboard({
  user,
  tasks,
  onStartTask,
  onContinueTask,
  onCompleteTask,
  onNavigate,
  onRequestCreateTask,
}: DashboardProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'In Progress' | 'Completed'>('All');
  const [priorityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ kind: 'single', date: new Date(), label: 'Today' });
  const [datePreset, setDatePreset] = useState<'today' | 'week' | 'month' | 'custom' | 'all'>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [clientQuickFilter, setClientQuickFilter] = useState<string>('All Clients');
  const [statusQuickFilter, setStatusQuickFilter] = useState<string>('All Statuses');
  const [selectedKPI, setSelectedKPI] = useState<'total' | 'completed' | 'inProgress' | 'pending' | null>(null);

  const applyDatePreset = (preset: 'Today' | 'This Week' | 'This Month' | 'Custom') => {
    if (preset === 'Today') {
      setDateFilter({ kind: 'single', date: new Date(), label: 'Today' });
      return;
    }
    if (preset === 'This Week') {
      const now = new Date();
      const day = now.getDay();
      const mondayOffset = (day + 6) % 7; // Monday as start of week
      const from = new Date(now);
      from.setDate(now.getDate() - mondayOffset);
      const to = new Date(from);
      to.setDate(from.getDate() + 6);
      setDateFilter({ kind: 'range', from, to, label: 'This Week' });
      return;
    }
    if (preset === 'This Month') {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateFilter({ kind: 'range', from, to, label: 'This Month' });
      return;
    }
    // Custom: keep as-is until user applies a range
    setDateFilter((prev) => (prev.kind === 'range' ? prev : { kind: 'all', label: 'Custom dates' }));
  };

  const onChangePreset = (value: string) => {
    const v = value as 'today' | 'week' | 'month' | 'custom' | 'all';
    setDatePreset(v);
    if (v === 'today') return applyDatePreset('Today');
    if (v === 'week') return applyDatePreset('This Week');
    if (v === 'month') return applyDatePreset('This Month');
    if (v === 'all') return setDateFilter({ kind: 'all', label: 'All dates' });
    // custom: show controls and wait for apply
    setDateFilter((prev) => (prev.kind === 'range' ? prev : { kind: 'all', label: 'Custom dates' }));
  };

  const applyCustomRange = () => {
    if (!customStartDate || !customEndDate) return;
    const from = new Date(customStartDate);
    const to = new Date(customEndDate);
    const fromSafe = from <= to ? from : to;
    const toSafe = to >= from ? to : from;
    setDateFilter({ kind: 'range', from: fromSafe, to: toSafe, label: 'Custom' });
  };

  const dateMatches = (scheduledDate?: string) => {
    if (!scheduledDate) return false;
    if (dateFilter.kind === 'all') return true;
    if (dateFilter.kind === 'single') {
      return scheduledDate === toDateKey(dateFilter.date);
    }
    const fromKey = toDateKey(dateFilter.from);
    const toKey = toDateKey(dateFilter.to);
    return scheduledDate >= fromKey && scheduledDate <= toKey;
  };

  const filteredTasks = useMemo(() => {
    const weight: Record<string, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 };
    const toMinutes = (t?: string) => {
      if (!t) return 24 * 60 + 59;
      const [h, m] = t.split(':').map(Number);
      if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
      return 24 * 60 + 59;
    };

    const base = tasks.filter((task) => {
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesDate = dateMatches(task.scheduledDate);
      const pr = (task as any).priority ?? 'Medium';
      const matchesPriority = priorityFilter === 'All' || pr === priorityFilter;
      const matchesClient = clientQuickFilter === 'All Clients' || task.clientName === clientQuickFilter;
      return matchesStatus && matchesDate && matchesPriority && matchesClient;
    });

    return base.sort((a, b) => {
      const pa = weight[((a as any).priority ?? 'Medium') as string] ?? 1;
      const pb = weight[((b as any).priority ?? 'Medium') as string] ?? 1;
      if (pb !== pa) return pb - pa;
      const ta = toMinutes(a.startTime);
      const tb = toMinutes(b.startTime);
      return ta - tb;
    });
  }, [tasks, statusFilter, dateFilter, priorityFilter, clientQuickFilter]);

  const nextTaskId = useMemo(() => {
    const first = filteredTasks.find((t) => t.status !== 'Completed');
    return first?.id;
  }, [filteredTasks]);

  const handleAddTask = () => {
    onRequestCreateTask(undefined);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Hero + Actions */}
      <div className="border-b bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

          <CardContent className="mt-4 rounded-xl border border-gray-100 shadow-sm bg-card p-4">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.username}</p>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <Select value={datePreset} onValueChange={onChangePreset}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder={getDateFilterLabelClean(dateFilter)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                    <SelectItem value="all">All Dates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Custom date range inputs (shown when Custom selected) */}
            {datePreset === 'custom' && (
              <Card className="mb-4">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Start Date</Label>
                      <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button size="sm" onClick={applyCustomRange}>Apply Range</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overdue Banner */}
            {(() => {
              const todayKey = toDateKey(new Date());
              const overdueCount = tasks.filter((t) => (t.scheduledDate ?? '') < todayKey && t.status !== 'Completed').length;
              if (!overdueCount) return null;
              return (
                <Card className="mt-4 rounded-xl shadow-sm border border-gray-100" style={{ backgroundColor: '#FDE7E7' }}>
                  <div className="flex items-center gap-2 p-4 text-red-800">
                    <CalendarDays className="h-4 w-4" />
                    <p className="text-sm font-medium">You have {overdueCount} overdue tasks that need attention.</p>
                  </div>
                </Card>
              );
            })()}

            {/* KPI Cards */}
            {(() => {
              // Match admin: compute stats from filteredTasks
              const total = filteredTasks.length;
              const completed = filteredTasks.filter((t) => t.status === 'Completed').length;
              const inProgress = filteredTasks.filter((t) => t.status === 'In Progress').length;
              const pending = filteredTasks.filter((t) => t.status === 'New').length;
              const baseCard = 'rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-shadow';
              const baseInner = 'flex items-center justify-between p-4';
              const titleCls = 'flex items-center gap-2 text-sm font-medium';
              const valueCls = 'text-3xl font-semibold';
              return (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 ">
                  <Card
                    data-selected={selectedKPI === 'total' ? 'true' : 'false'}
                    onClick={() => setSelectedKPI('total')}
                    className={`${baseCard} bg-card text-card-foreground cursor-pointer select-none data-[selected=true]:ring-2 data-[selected=true]:ring-primary/40`}
                    style={{ backgroundColor: '#E3F2FD', color: 'black' }}
                  >
                    <div className={baseInner}>
                      <div className={`${titleCls} text-black`}>
                        <ListTodo className="h-4 w-4 text-black" />
                        Total Tasks
                      </div>
                      <div className={`${valueCls} text-black`}>{total}</div>
                    </div>
                  </Card>

                  <Card
                    data-selected={selectedKPI === 'completed' ? 'true' : 'false'}
                    onClick={() => setSelectedKPI('completed')}
                    className={`${baseCard} bg-card text-card-foreground cursor-pointer select-none data-[selected=true]:ring-2 data-[selected=true]:ring-primary/40`}
                    style={{ backgroundColor: '#E8F5E9', color: 'black' }}
                  >
                    <div className={baseInner}>
                      <div className={`${titleCls} text-black`}>
                        <CheckCircle2 className="h-4 w-4 text-black" />
                        Completed
                      </div>
                      <div className={`${valueCls} text-black`}>{completed}</div>
                    </div>
                  </Card>

                  <Card
                    data-selected={selectedKPI === 'inProgress' ? 'true' : 'false'}
                    onClick={() => setSelectedKPI('inProgress')}
                    className={`${baseCard} bg-card text-card-foreground cursor-pointer select-none data-[selected=true]:ring-2 data-[selected=true]:ring-primary/40`}
                    style={{ backgroundColor: '#E3F2FD', color: 'black' }}
                  >
                    <div className={baseInner}>
                      <div className={`${titleCls} text-black`}>
                        <Clock3 className="h-4 w-4 text-black" />
                        In Progress
                      </div>
                      <div className={`${valueCls} text-black`}>{inProgress}</div>
                    </div>
                  </Card>

                  <Card
                    data-selected={selectedKPI === 'pending' ? 'true' : 'false'}
                    onClick={() => setSelectedKPI('pending')}
                    className={`${baseCard} bg-card text-card-foreground cursor-pointer select-none data-[selected=true]:ring-2 data-[selected=true]:ring-primary/40`}
                    style={{ backgroundColor: '#FFF3E0', color: 'black' }}
                  >
                    <div className={baseInner}>
                      <div className={`${titleCls} text-black`}>
                        <Hourglass className="h-4 w-4 text-black" />
                        Pending
                      </div>
                      <div className={`${valueCls} text-black`}>{pending}</div>
                    </div>
                  </Card>
                </div>

              );
            })()}
          </CardContent>

          {/* Quick Filters */}
          <Card className="mt-4 rounded-xl border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Quick Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex w-full items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                {/* All Clients */}
                <Select value={clientQuickFilter} onValueChange={setClientQuickFilter}>
                  <SelectTrigger size="sm" className="shrink-0 w-[150px] sm:w-[180px] text-sm">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Clients">All Clients</SelectItem>
                    {Array.from(new Set(tasks.map((t) => t.clientName))).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* All Statuses */}
                <Select
                  value={statusQuickFilter}
                  onValueChange={(v) => {
                    setStatusQuickFilter(v);
                    const map: Record<string, 'All' | 'New' | 'In Progress' | 'Completed'> = {
                      'All Statuses': 'All',
                      Completed: 'Completed',
                      'In Progress': 'In Progress',
                      Pending: 'New',
                    };
                    setStatusFilter(map[v] ?? 'All');
                  }}
                >
                  <SelectTrigger size="sm" className="shrink-0 w-[150px] sm:w-[180px] text-sm">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Statuses">All Statuses</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 sm:ml-auto"
                  onClick={() => {
                    setDatePreset('today');
                    setCustomStartDate('');
                    setCustomEndDate('');
                    applyDatePreset('Today');
                    setClientQuickFilter('All Clients');
                    setStatusQuickFilter('All Statuses');
                    setStatusFilter('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-3 sm:px-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-1 text-lg font-semibold">Scheduled Tasks</h3>
            <span className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'}
            </span>
          </div>
          {/* Priority legend removed per request */}

          {filteredTasks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center text-muted-foreground space-y-3">
                <CalendarDays className="mx-auto h-10 w-10 opacity-30" />
                <p>No tasks for the selected range. Enjoy your day or check another date!</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => { setStatusFilter('All'); setDateFilter({ kind: 'all', label: 'All dates' }); }}>View All Tasks</Button>
                  <Button size="sm" onClick={handleAddTask}>Add New Task</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStart={() => onStartTask(task)}
                onContinue={() => onContinueTask(task)}
                onComplete={() => onCompleteTask(task)}
              />
            ))
          )}
        </div>
      </div>
    </div >
  );
}






