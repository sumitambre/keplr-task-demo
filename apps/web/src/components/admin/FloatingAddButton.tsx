'use client';
import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@repo/ui";
import { Label } from "@repo/ui";
import { Checkbox } from "@repo/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui";
import { Badge } from "@repo/ui";
import { ComboboxPopover } from "@repo/ui";
import FormBuilder from "../admin/forms/FormBuilder";
import { mockTaskTypes, mockUsers, mockClients, priorities } from "../../database/mockData";

/**
 * Fully self-contained Floating Add Task button + Dialog
 * - Multi-select for Task Types, Service Types, and Assignees
 * - "Add New" for Task Types and Service Types (opens Dialogs correctly)
 * - Client selection auto-loads Sites, Allowed Task Types, and Service Types
 * - Uses in-memory mock data; no network calls needed
 * - Ready to drop into your app. Make sure the shadcn paths match your project.
 */

// ------------------------- Utils -------------------------
function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function getDefaultDueDate() {
  const dt = new Date();
  dt.setDate(dt.getDate() + 2);
  return formatDate(dt);
}
function generateTaskId() {
  const anyCrypto: any = (globalThis as any)?.crypto;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ------------------------- Component -------------------------
// Get API URL from environment variable
const API_URL = ((import.meta as any)?.env?.VITE_API_URL as string | undefined) ?? '';

export function TaskDialog({ open, onOpenChange, taskToEdit }: { open: boolean; onOpenChange: (open: boolean) => void; taskToEdit?: any }) {
  const [apiUsers, setApiUsers] = useState<any[]>([]);

  // Fetch users from API when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const base = API_URL?.replace(/\/$/, '') || '';
        const response = await fetch(`${base}/api/users`);
        const users = await response.json();
        setApiUsers(users);
        setDataSources(prev => ({ ...prev, users: users.map((u: any) => u.name) }));
      } catch (error) {
        console.error('Failed to fetch users:', error);
        // Fallback to mock users
        setApiUsers(mockUsers as any);
      }
    };
    if (open) fetchUsers();
  }, [open]);

  // parent-owned lists (non-mutating updates)
  const [dataSources, setDataSources] = useState<Record<string, any>>({
    clients: mockClients.map(c => c.name),
    sites: [],
    taskTypes: mockTaskTypes.map(t => t.name),
    serviceTypes: Array.from(new Set(mockClients.flatMap(c => c.serviceTypes || []))),
    users: [],
  });

  const [formData, setFormData] = useState<any>({
    client: "",
    clientSite: "",
    onsiteContactName: "",
    contactNumber: "",
    taskTypes: [],
    serviceTypes: [],
    assignees: [],
    priority: "Medium",
    dueDate: getDefaultDueDate(),
    titleTemplate: "",
    description: "",
  });

  // Initialize form data when editing
  useEffect(() => {
    if (open && taskToEdit) {
      setFormData({
        client: taskToEdit.client || "",
        clientSite: taskToEdit.clientSite || "",
        onsiteContactName: taskToEdit.contactName || "",
        contactNumber: taskToEdit.contactNumber || "",
        taskTypes: taskToEdit.taskType ? [taskToEdit.taskType] : [],
        serviceTypes: [], // Service types not typically on task object in this simple model
        assignees: taskToEdit.assignedTo ? [taskToEdit.assignedTo] : [],
        priority: taskToEdit.priority || "Medium",
        dueDate: taskToEdit.dueDate || getDefaultDueDate(),
        titleTemplate: taskToEdit.title || "",
        description: taskToEdit.description || "",
      });
    } else if (open && !taskToEdit) {
      // Reset to default for new task
      setFormData({
        client: "",
        clientSite: "",
        onsiteContactName: "",
        contactNumber: "",
        taskTypes: [],
        serviceTypes: [],
        assignees: [],
        priority: "Medium",
        dueDate: getDefaultDueDate(),
        titleTemplate: "",
        description: "",
      });
    }
  }, [open, taskToEdit]);

  const [onlyShowAvailable, setOnlyShowAvailable] = useState(false);

  // compute prioritized assignees for the custom picker (match + available)
  const orderedAssignees = useMemo(() => {
    const requiredSkills = (formData.taskTypes || [])
      .map((n: string) => mockTaskTypes.find(t => t.name === n)?.skillRequired)
      .filter(Boolean) as string[];
    const skillSet = new Set(requiredSkills);

    let items = apiUsers.map(u => ({
      name: u.name,
      available: !!u.available,
      skills: u.skills || [],
      matchCount: (u.skills || []).reduce((acc: number, s: string) => acc + (skillSet.has(s) ? 1 : 0), 0)
    }));

    if (onlyShowAvailable) items = items.filter(i => i.available);

    items.sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      if (a.available !== b.available) return a.available ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return items;
  }, [formData.taskTypes, onlyShowAvailable, apiUsers]);

  useEffect(() => {
    // keep simple name list for FormBuilder compatibility
    setDataSources(prev => ({ ...prev, users: orderedAssignees.map((i: any) => i.name) }));
  }, [orderedAssignees]);

  const handleAddDataSource = (key: string, item: string) => {
    if (!item) return;
    setDataSources(prev => ({
      ...prev,
      [key]: prev[key]?.includes(item) ? prev[key] : [...(prev[key] || []), item]
    }));
  };

  // When client changes, update dependent data sources and clamp selections
  useEffect(() => {
    const client = mockClients.find(c => c.name === formData.client);
    const sites = client ? client.sites.map(s => s.name) : [];
    const allowedTaskTypes = client
      ? mockTaskTypes.filter(t => (client.taskTypeIds || []).includes(t.id)).map(t => t.name)
      : mockTaskTypes.map(t => t.name);
    const svcTypes = client ? (client.serviceTypes || []) : Array.from(new Set(mockClients.flatMap(c => c.serviceTypes || [])));

    setDataSources(prev => ({ ...prev, sites, taskTypes: allowedTaskTypes, serviceTypes: svcTypes }));

    // Clamp selections if now invalid (only if not editing or if user changed client)
    // We need to be careful not to clear data when first loading edit form
    // But since we set formData in useEffect, this might run after.
    // Ideally we only clamp if the client *changed* from what was in formData.
    // For simplicity, we'll skip clamping on initial load if values match.
  }, [formData.client]);

  async function handleSaveFromForm() {
    const errors: string[] = [];
    if (!formData.client) errors.push('Client is required');
    if (!formData.clientSite) errors.push('Client Site is required');
    if (!formData.taskTypes || formData.taskTypes.length === 0) errors.push('At least one Task Type');
    if (!formData.assignees || formData.assignees.length === 0) errors.push('At least one Assignee');
    if (!formData.dueDate) errors.push('Due Date is required');
    if (errors.length) {
      console.warn('Validation errors:', errors);
      return;
    }

    const client = mockClients.find(c => c.name === formData.client);
    const site = client?.sites.find(s => s.name === formData.clientSite);
    const taskTypeIds = (formData.taskTypes || [])
      .map((n: string) => mockTaskTypes.find(t => t.name === n)?.id)
      .filter(Boolean);
    const assigneeIds = (formData.assignees || [])
      .map((n: string) => apiUsers.find(u => u.name === n)?.id)
      .filter(Boolean);

    const payload = {
      title: formData.titleTemplate?.trim() || `Task for ${formData.client} - ${formData.clientSite}`,
      taskType: formData.taskTypes[0] || '', // Use first task type
      taskTypeId: taskTypeIds[0] || 1,
      client: formData.client,
      clientId: client?.id ?? null,
      clientSite: formData.clientSite,
      siteId: site?.id ?? null,
      assignedTo: formData.assignees[0] || '', // Use first assignee
      assignedUserId: assigneeIds[0] || null,
      priority: formData.priority || 'Medium',
      status: taskToEdit ? taskToEdit.status : 'New', // Preserve status on edit
      dueDate: formData.dueDate,
      scheduledDate: formData.dueDate,
      description: formData.description || '',
      skillRequired: mockTaskTypes.find(t => t.id === taskTypeIds[0])?.skillRequired || '',
      contactName: formData.onsiteContactName || '',
      contactNumber: formData.contactNumber || '',
    };

    console.log(taskToEdit ? 'Updating task:' : 'Creating task:', payload);

    try {
      const API_URL = ((import.meta as any)?.env?.VITE_API_URL as string | undefined) ?? '';
      const base = API_URL?.replace(/\/$/, '') || '';

      const url = taskToEdit ? `${base}/api/tasks/${taskToEdit.id}` : `${base}/api/tasks`;
      const method = taskToEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(taskToEdit ? 'Failed to update task' : 'Failed to create task');
      }

      const result = await response.json();
      console.log(taskToEdit ? 'Task updated successfully:' : 'Task created successfully:', result);

      // Show success message
      const toast = (await import('sonner')).toast;
      toast.success(taskToEdit ? 'Task updated successfully!' : 'Task created successfully!');

      // Close dialog and refresh page to show new task
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error(taskToEdit ? 'Error updating task:' : 'Error creating task:', error);
      const toast = (await import('sonner')).toast;
      toast.error(taskToEdit ? 'Failed to update task. Please try again.' : 'Failed to create task. Please try again.');
    }
  }

  const renderExtras = (local: any, { setRootField }: any) => {
    const items = orderedAssignees.map((i) => ({
      id: i.name,
      name: i.name,
      available: i.available,
      matchCount: i.matchCount,
      skills: i.skills,
    }));
    const selected = Array.isArray(local.assignees) ? local.assignees : [];
    return (
      <div className="md:col-span-2">
        <ComboboxPopover
          title="Assign To"
          items={items as any}
          selectedItems={selected}
          onSelectionChange={(sel: string[]) => setRootField('assignees', sel)}
          triggerText="Select assignees"
          searchPlaceholder="Search people..."
          emptyText="No people found."
          renderHeader={() => (
            <div className="flex items-center gap-2 px-3 py-2 border-b text-xs">
              <Checkbox id="only-available" checked={onlyShowAvailable} onCheckedChange={(v: any) => setOnlyShowAvailable(!!v)} />
              <Label htmlFor="only-available" className="text-xs">Only show available</Label>
            </div>
          )}
          renderItem={(item: any) => (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={selected.includes(item.id)} className="mr-1" />
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.matchCount > 0 && <Badge variant="outline">Match {item.matchCount}</Badge>}
                <Badge variant={item.available ? 'default' : 'secondary'}>{item.available ? 'Available' : 'Busy'}</Badge>
                <span className="text-xs text-muted-foreground">{item.skills.join(', ')}</span>
              </div>
            </div>
          )}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="py-4 pr-2 overflow-hidden flex-1 min-h-0">
          <FormBuilder
            schema={{
              title: taskToEdit ? `Edit Task: ${taskToEdit.title}` : (formData && formData.client ? `Task: ${formData.client}` : 'Add New Task'),
              sections: [
                {
                  key: 'root',
                  title: 'Task',
                  fields: [
                    { key: 'client', label: 'Client', type: 'combobox', dataSourceKey: 'clients', multiple: false },
                    { key: 'clientSite', label: 'Client Site', type: 'combobox', dataSourceKey: 'sites', multiple: false },
                    { key: 'onsiteContactName', label: 'On-Site Contact Name', type: 'text' },
                    { key: 'contactNumber', label: 'Contact Number', type: 'tel' },
                    { key: 'taskTypes', label: 'Task Types', type: 'combobox', dataSourceKey: 'taskTypes', multiple: true, helperText: 'Manage in Settings → Work Structure.' },
                    { key: 'serviceTypes', label: 'Service Types', type: 'combobox', dataSourceKey: 'serviceTypes', multiple: true },
                    { key: 'priority', label: 'Priority', type: 'select', options: priorities.map(p => ({ value: p, label: p })) },
                    { key: 'dueDate', label: 'Due Date', type: 'date' },
                    { key: 'titleTemplate', label: 'Title Template', type: 'text' },
                    { key: 'description', label: 'Description', type: 'text' },
                  ] as any,
                },
              ],
            } as any}
            value={formData as any}
            onChange={(next: any) => setFormData(next)}
            onSave={handleSaveFromForm}
            onCancel={() => { onOpenChange(false); }}
            submitLabel={taskToEdit ? "Update Task" : "Create Task"}
            dataSources={dataSources}
            renderExtras={renderExtras}
            extrasAfterFieldKey="serviceTypes"
          // Use FormBuilder's built-in actions
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Add Button */}
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50" size="icon" title="Add Task">
        <Plus className="h-6 w-6" />
      </Button>

      <TaskDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
