import type { Schema } from "../admin/forms/FormBuilder";

// Technician task header schema. Session UI is injected via renderExtras in the wrapper.
export const taskSessionSchema: Schema = {
  sections: [
    {
      key: "root",
      title: "Task Details",
      fields: [
        { key: "client", label: "Client", type: "combobox", dataSourceKey: "clients" },
        { key: "clientSite", label: "Client Site", type: "combobox", dataSourceKey: "sites" },
        { key: "taskType", label: "Task Type", type: "combobox", dataSourceKey: "taskTypes" },
        { key: "title", label: "Work Title", type: "text" },
        { key: "priority", label: "Priority", type: "select", options: [
          { value: "Low", label: "Low" },
          { value: "Medium", label: "Medium" },
          { value: "High", label: "High" },
        ] },
        { key: "status", label: "Status", type: "select", options: [
          { value: "New", label: "New" },
          { value: "In Progress", label: "In Progress" },
          { value: "Completed", label: "Completed" },
        ] },
      ],
    },
  ],
};

export type TaskHeaderValue = {
  client?: string;
  clientSite?: string;
  taskType?: string;
  title?: string;
  priority?: "Low" | "Medium" | "High";
  status?: "New" | "In Progress" | "Completed";
};
