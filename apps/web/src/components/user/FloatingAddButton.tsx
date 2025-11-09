import { useState } from "react";
import { Button } from "@repo/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui";
import { Input } from "@repo/ui";
import { Label } from "@repo/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { Textarea } from "@repo/ui";
import { Plus } from "lucide-react";

// Mock data (would be shared/imported in real app)
const mockTaskTypes = [
  {
    id: 1,
    name: "Network Installation",
    skillRequired: "Network",
  },
  { id: 2, name: "CCTV Setup", skillRequired: "CCTV" },
  {
    id: 3,
    name: "Biometric Installation",
    skillRequired: "Biometric",
  },
  {
    id: 4,
    name: "Access Control Setup",
    skillRequired: "Access Control",
  },
  {
    id: 5,
    name: "Fire Safety Installation",
    skillRequired: "Fire Safety",
  },
];

const mockClients = [
  { id: 1, name: "ABC Corp", sites: [
    { id: 1, name: "Main Office", address: "123 Business Ave" },
    { id: 2, name: "Warehouse", address: "456 Storage St" }
  ]},
  { id: 2, name: "XYZ Inc", sites: [
    { id: 3, name: "HQ Building", address: "789 Tech Park" }
  ]},
  { id: 3, name: "Tech Solutions", sites: [
    { id: 4, name: "Head Office", address: "321 Innovation Drive" }
  ]},
  { id: 4, name: "Global Systems", sites: [
    { id: 5, name: "Corporate HQ", address: "654 Enterprise Blvd" },
    { id: 6, name: "Data Center", address: "987 Server Lane" }
  ]},
];

const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    role: "Staff",
    skills: ["Network", "Fire Safety"],
    available: true,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Staff",
    skills: ["CCTV", "Access Control"],
    available: true,
  },
  {
    id: 3,
    name: "Mike Davis",
    role: "Staff",
    skills: ["Biometric", "Network"],
    available: false,
  },
  {
    id: 4,
    name: "Lisa Wilson",
    role: "Staff",
    skills: ["Electrical", "Fire Safety"],
    available: true,
  },
  {
    id: 5,
    name: "Tom Brown",
    role: "Staff",
    skills: ["Network", "CCTV"],
    available: true,
  },
];

const priorities = ["Low", "Medium", "High", "Critical"];
const statuses = [
  "Pending",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];

export function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [availableSites, setAvailableSites] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    taskType: "",
    client: "",
    clientSite: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
    description: "",
  });

  const handleTaskTypeChange = (taskTypeId: string) => {
    const selectedTaskType = mockTaskTypes.find(
      (t) => t.id.toString() === taskTypeId,
    );
    if (selectedTaskType) {
      const usersWithSkill = mockUsers.filter(
        (user) =>
          user.available &&
          user.skills.includes(selectedTaskType.skillRequired),
      );
      setAvailableUsers(usersWithSkill);
      setFormData({
        ...formData,
        taskType: selectedTaskType.name,
        assignedTo: "",
      });
    }
  };

  const handleSave = () => {
    // In real app, this would save to backend/state management
    console.log("Saving task:", formData);
    setIsOpen(false);
    setFormData({
      title: "",
      taskType: "",
      client: "",
      clientSite: "",
      assignedTo: "",
      priority: "Medium",
      dueDate: "",
      description: "",
    });
    setAvailableUsers([]);
    setAvailableSites([]);
  };

  const handleOpen = () => {
    setFormData({
      title: "",
      taskType: "",
      client: "",
      clientSite: "",
      assignedTo: "",
      priority: "Medium",
      dueDate: "",
      description: "",
    });
    setAvailableUsers([]);
    setAvailableSites([]);
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Add Button */}
      <Button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
        title="Add Task"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Task Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to the appropriate team member based on their skills.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                placeholder="Enter task title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskType">Task Type</Label>
                <Select onValueChange={handleTaskTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTaskTypes.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id.toString()}
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="client">Client</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) => {
                    const selectedClient = mockClients.find(c => c.name === value);
                    setAvailableSites(selectedClient?.sites || []);
                    setFormData({ ...formData, client: value, clientSite: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem
                        key={client.id}
                        value={client.name}
                      >
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="clientSite">Client Site</Label>
              <Select
                value={formData.clientSite}
                onValueChange={(value) => setFormData({ ...formData, clientSite: value })}
                disabled={availableSites.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    availableSites.length === 0 
                      ? "Select client first" 
                      : "Select site"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSites.map((site) => (
                    <SelectItem key={site.id} value={site.name}>
                      {site.name} - {site.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    assignedTo: value,
                  })
                }
                disabled={availableUsers.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableUsers.length === 0
                        ? "Select task type first"
                        : "Select user"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name} ({user.skills.join(", ")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Create Task
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
