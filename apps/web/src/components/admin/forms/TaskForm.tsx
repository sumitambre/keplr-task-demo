import React, { useEffect, useState } from "react";
import FormBuilder from "./FormBuilder";

export type TaskFormValue = {
  client?: string;
  clientSite?: string;
  onsiteContactName?: string;
  contactNumber?: string;
  taskTypes?: string[];
  serviceTypes?: string[];
  assignees?: string[];
  priority?: string;
  dueDate?: string;
  status?: string;
  titleTemplate?: string;
  description?: string;
};

export default function TaskForm({
  value,
  onChange,
  onSave,
  onCancel,
  dataSources,
  onAddDataSource,
  submitLabel = "Save",
  showActions = true,
  renderExtras,
}: {
  value: TaskFormValue;
  onChange: (next: TaskFormValue) => void;
  onSave: () => void;
  onCancel: () => void;
  dataSources: Record<string, any>;
  onAddDataSource?: (key: string, item: string) => void;
  submitLabel?: string;
  showActions?: boolean;
  renderExtras?: (local: any, helpers: any) => React.ReactNode;
}) {
  const [local, setLocal] = useState<TaskFormValue>(value || ({} as TaskFormValue));
  useEffect(() => setLocal(value), [value]);

  const schema = {
    title: value && value.client ? `Task: ${value.client}` : "Add New Task",
    sections: [
      {
        key: "root",
        title: "Task",
        fields: [
          { key: "client", label: "Client", type: "combobox", dataSourceKey: "clients", multiple: false },
          { key: "clientSite", label: "Client Site", type: "combobox", dataSourceKey: "sites", multiple: false },
          { key: "onsiteContactName", label: "On-Site Contact Name", type: "text" },
          { key: "contactNumber", label: "Contact Number", type: "tel" },
          { key: "taskTypes", label: "Task Types", type: "combobox", dataSourceKey: "taskTypes", multiple: true },
          { key: "serviceTypes", label: "Service Types", type: "combobox", dataSourceKey: "serviceTypes", multiple: true },
          // assignees handled via renderExtras (custom picker) so remove from schema
          { key: "priority", label: "Priority", type: "select", options: [{ value: "Low", label: "Low" }, { value: "Medium", label: "Medium" }, { value: "High", label: "High" }] },
          { key: "dueDate", label: "Due Date", type: "text" },
          { key: "status", label: "Status", type: "select", options: [{ value: "New", label: "New" }, { value: "In-Progress", label: "In-Progress" }, { value: "Completed", label: "Completed" }] },
          { key: "titleTemplate", label: "Title Template", type: "text" },
          { key: "description", label: "Description", type: "text" },
        ],
      },
    ],
  };

  const handleChange = (next: TaskFormValue) => {
    setLocal(next);
    onChange(next);
  };

  return (
    <FormBuilder
      schema={schema as any}
      value={local as any}
      onChange={(next: any) => handleChange(next)}
      onSave={onSave}
      onCancel={onCancel}
      submitLabel={submitLabel}
      dataSources={dataSources}
      renderExtras={renderExtras}
      showSubmit={showActions}
    />
  );
}
