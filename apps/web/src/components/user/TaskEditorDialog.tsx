import React, { useEffect, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/dialog';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/popover';
import { Calendar } from '@repo/ui/calendar';
import { cn } from '@repo/ui/utils';
import type { Task } from '../App';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type TaskStatus = Task['status'];

export type TaskEditorValues = {
  clientName: string;
  title: string;
  status: TaskStatus;
  scheduledDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  remarks?: string;
};

type TaskEditorDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: TaskEditorValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TaskEditorValues) => void;
};

const STATUSES: TaskStatus[] = ['New', 'In Progress', 'Completed'];
const SUGGESTED_CLIENTS = [
  'ABC Corporation',
  'XYZ Hotel',
  'Tech Solutions Ltd',
  'Green Energy Co',
  'Metro Construction',
];

const toDateKey = (date: Date) => {
  const normalized = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return normalized.toISOString().slice(0, 10);
};

const parseDateKey = (value?: string) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const formatDateLabel = (value?: string) => {
  if (!value) return 'Select date';
  return new Date(value + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const currentTimeHHMM = () => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export function TaskEditorDialog({ open, mode, initialValues, onOpenChange, onSubmit }: TaskEditorDialogProps) {
  const TaskEditorSchema = z.object({
    clientName: z.string().min(1, 'Client is required'),
    title: z.string().min(1, 'Title is required'),
    status: z.enum(['New', 'In Progress', 'Completed']),
    scheduledDate: z.string().min(1, 'Date is required'),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine((v) => v.status !== 'In Progress' || !!(v.startTime && v.startTime.trim()), {
    path: ['startTime'],
    message: 'Start time required when In Progress',
  })
  .refine((v) => v.status !== 'Completed' || !!(v.endTime && v.endTime.trim()), {
    path: ['endTime'],
    message: 'End time required when Completed',
  });

  const form = useForm<TaskEditorValues>({
    resolver: zodResolver(TaskEditorSchema),
    defaultValues: {
      clientName: initialValues?.clientName ?? '',
      title: initialValues?.title ?? '',
      status: (initialValues?.status as TaskStatus) ?? 'New',
      scheduledDate: initialValues?.scheduledDate ?? toDateKey(new Date()),
      startTime: initialValues?.startTime ?? (mode === 'create' ? currentTimeHHMM() : ''),
      endTime: initialValues?.endTime ?? '',
      remarks: initialValues?.remarks ?? '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const { control, handleSubmit, reset, watch, setValue, formState } = form;

  const [scheduledDate, setScheduledDate] = useState<Date>(() => parseDateKey(initialValues?.scheduledDate));

  useEffect(() => {
    reset({
      clientName: initialValues?.clientName ?? '',
      title: initialValues?.title ?? '',
      status: (initialValues?.status as TaskStatus) ?? 'New',
      scheduledDate: initialValues?.scheduledDate ?? toDateKey(new Date()),
      startTime: initialValues?.startTime ?? (mode === 'create' ? currentTimeHHMM() : ''),
      endTime: initialValues?.endTime ?? '',
      remarks: initialValues?.remarks ?? '',
    });
    setScheduledDate(parseDateKey(initialValues?.scheduledDate));
  }, [initialValues, mode, open, reset]);

  const status = watch('status');
  const isCompleted = status === 'Completed';

  const onSubmitForm = handleSubmit((values) => {
    const dateKey = values.scheduledDate || toDateKey(scheduledDate);
    onSubmit({
      ...values,
      clientName: values.clientName.trim(),
      title: values.title.trim(),
      scheduledDate: dateKey,
      startTime: values.startTime?.trim() || undefined,
      endTime: values.endTime?.trim() || undefined,
      remarks: values.remarks?.trim() || undefined,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Task' : 'Edit Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new technician task for any scheduled date to test filter scenarios.'
              : 'Update task details, status, or schedule to keep information accurate.'}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmitForm(); }}>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="client">Client name</Label>
              <Controller
                control={control}
                name="clientName"
                render={({ field }) => (
                  <Input id="client" placeholder="Enter client name" list="task-editor-clients" {...field} />
                )}
              />
              {formState.errors.clientName && (
                <p className="text-xs text-destructive">{formState.errors.clientName.message as any}</p>
              )}
              <datalist id="task-editor-clients">
                {SUGGESTED_CLIENTS.map((client) => (
                  <option key={client} value={client} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Task title</Label>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <Input id="title" placeholder="Describe the work" {...field} />
                )}
              />
              {formState.errors.title && (
                <p className="text-xs text-destructive">{formState.errors.title.message as any}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Scheduled date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn('w-full justify-start gap-2 text-left font-normal', !scheduledDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {formatDateLabel(toDateKey(scheduledDate))}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setScheduledDate(date);
                      setValue('scheduledDate', toDateKey(date), { shouldDirty: true });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formState.errors.scheduledDate && (
                <p className="text-xs text-destructive">{formState.errors.scheduledDate.message as any}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v: TaskStatus) => field.onChange(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start time</Label>
                <Controller
                  control={control}
                  name="startTime"
                  render={({ field }) => (
                    <Input id="startTime" type="time" disabled={watch('status') === 'New'} {...field} />
                  )}
                />
                {formState.errors.startTime && (
                  <p className="text-xs text-destructive">{formState.errors.startTime.message as any}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End time</Label>
                <Controller
                  control={control}
                  name="endTime"
                  render={({ field }) => (
                    <Input id="endTime" type="time" disabled={watch('status') !== 'Completed'} {...field} />
                  )}
                />
                {formState.errors.endTime && (
                  <p className="text-xs text-destructive">{formState.errors.endTime.message as any}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Internal notes</Label>
              <Controller
                control={control}
                name="remarks"
                render={({ field }) => (
                  <Textarea id="remarks" placeholder="Add optional notes, reminders, or follow-up actions" rows={3} {...field} />
                )}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Create task' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

