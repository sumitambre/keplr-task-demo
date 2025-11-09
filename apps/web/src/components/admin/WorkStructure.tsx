

import { Fragment, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Button,
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui";
import FormBuilder, { type Schema } from "./forms/FormBuilder";
import { ResponsiveCardTable } from "./ResponsiveCardTable";
import { mockTaskTypes } from "../../database/mockData";

type Status = "active" | "inactive";

type Department = {
  id: string;
  name: string;
  status: Status;
};

type Skill = {
  id: string;
  name: string;
  status: Status;
};

type TaskType = {
  id: string;
  name: string;
  departmentId: string;
  skillIds: string[];
  status: Status;
};

type DepartmentFormValues = {
  name: string;
  status: Status;
};

type SkillFormValues = DepartmentFormValues;

type TaskTypeFormValues = {
  name: string;
  departmentId: string;
  skillIds: string[];
  status: Status;
};

const statusOptions: { value: Status; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const departmentFormSchema: Schema = {
  sections: [
    {
      key: "root",
      fields: [
        { key: "name", label: "Department Name", type: "text", required: true },
        { key: "status", label: "Status", type: "select", options: statusOptions },
      ],
    },
  ],
};

const skillFormSchema: Schema = {
  sections: [
    {
      key: "root",
      fields: [
        { key: "name", label: "Skill Name", type: "text", required: true },
        { key: "status", label: "Status", type: "select", options: statusOptions },
      ],
    },
  ],
};

const defaultDepartmentForm: DepartmentFormValues = {
  name: "",
  status: "active",
};

const defaultSkillForm: SkillFormValues = {
  name: "",
  status: "active",
};

const defaultTaskTypeForm = (departmentId: string | undefined): TaskTypeFormValues => ({
  name: "",
  departmentId: departmentId ?? "",
  skillIds: [],
  status: "active",
});

const seedDepartments = ["IT", "Security", "Facilities"];
const seedSkills = [
  "Network",
  "Fire Safety",
  "CCTV",
  "Access Control",
  "Biometric",
  "Electrical",
];

const skillToDepartment: Record<string, string> = {
  Network: "IT",
  "Fire Safety": "Facilities",
  CCTV: "Security",
  "Access Control": "Security",
  Biometric: "Security",
  Electrical: "Facilities",
};

const createId = () => {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
};

function buildInitialData() {
  const departments: Department[] = seedDepartments.map((name) => ({
    id: createId(),
    name,
    status: "active",
  }));

  const skills: Skill[] = Array.from(
    new Set([...seedSkills, ...mockTaskTypes.map((t) => t.skillRequired)])
  ).map((name) => ({ id: createId(), name, status: "active" }));

  const departmentByName = new Map(departments.map((d) => [d.name, d.id]));
  const skillByName = new Map(skills.map((s) => [s.name, s.id]));
  const defaultDepartmentId = departments[0]?.id ?? createId();

  const taskTypes: TaskType[] = mockTaskTypes.map((t) => {
    const departmentId =
      departmentByName.get(skillToDepartment[t.skillRequired]) ?? defaultDepartmentId;
    const skillId = skillByName.get(t.skillRequired);
    return {
      id: createId(),
      name: t.name,
      departmentId,
      skillIds: skillId ? [skillId] : [],
      status: t.active ? "active" : "inactive",
    };
  });

  return { departments, skills, taskTypes };
}

function createTaskTypeSchema(
  departmentOptions: { value: string; label: string }[]
): Schema {
  return {
    sections: [
      {
        key: "root",
        fields: [
          { key: "name", label: "Task Type Name", type: "text", required: true },
          {
            key: "departmentId",
            label: "Department",
            type: "select",
            options: departmentOptions,
            required: true,
          },
          {
            key: "skillIds",
            label: "Required Skills",
            type: "combobox",
            multiple: true,
            dataSourceKey: "skills",
          },
          { key: "status", label: "Status", type: "select", options: statusOptions },
        ],
      },
    ],
  };
}

export function WorkStructure() {
  const initialData = useMemo(() => buildInitialData(), []);
  const [departments, setDepartments] = useState<Department[]>(() => initialData.departments);
  const [skills, setSkills] = useState<Skill[]>(() => initialData.skills);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(() => initialData.taskTypes);

  const [departmentFormValues, setDepartmentFormValues] =
    useState<DepartmentFormValues>(defaultDepartmentForm);
  const [skillFormValues, setSkillFormValues] =
    useState<SkillFormValues>(defaultSkillForm);
  const [taskTypeFormValues, setTaskTypeFormValues] = useState<TaskTypeFormValues>(
    defaultTaskTypeForm(initialData.departments[0]?.id)
  );

  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isTaskTypeDialogOpen, setIsTaskTypeDialogOpen] = useState(false);

  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingTaskTypeId, setEditingTaskTypeId] = useState<string | null>(null);

  const departmentLookup = useMemo(
    () => new Map(departments.map((dept) => [dept.id, dept.name])),
    [departments]
  );
  const skillLookup = useMemo(
    () => new Map(skills.map((skill) => [skill.id, skill.name])),
    [skills]
  );

  const departmentOptions = useMemo(
    () => departments.map((dept) => ({ value: dept.id, label: dept.name })),
    [departments]
  );

  const skillDataSource = useMemo(
    () => skills.map((skill) => ({ id: skill.id, name: skill.name })),
    [skills]
  );

  const taskTypeFormSchema = useMemo(
    () => createTaskTypeSchema(departmentOptions),
    [departmentOptions]
  );

  const filteredDepartments = useMemo(() => departments, [departments]);
  const filteredSkills = useMemo(() => skills, [skills]);
  const filteredTaskTypes = useMemo(() => taskTypes, [taskTypes]);

  const resetDepartmentForm = () => {
    setDepartmentFormValues(defaultDepartmentForm);
    setEditingDepartmentId(null);
    setIsDepartmentDialogOpen(false);
  };

  const resetSkillForm = () => {
    setSkillFormValues(defaultSkillForm);
    setEditingSkillId(null);
    setIsSkillDialogOpen(false);
  };

  const resetTaskTypeForm = (departmentId?: string) => {
    setTaskTypeFormValues(defaultTaskTypeForm(departmentId ?? departments[0]?.id));
    setEditingTaskTypeId(null);
    setIsTaskTypeDialogOpen(false);
  };

  const handleDepartmentSubmit = () => {
    const name = departmentFormValues.name.trim();
    if (!name) return toast.error("Department name is required.");
    const normalized = name.toLowerCase();
    const duplicate = departments.some(
      (d) => d.name.trim().toLowerCase() === normalized && d.id !== editingDepartmentId
    );
    if (duplicate) return toast.error("Department name must be unique.");

    if (editingDepartmentId) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDepartmentId
            ? { ...d, name, status: departmentFormValues.status }
            : d
        )
      );
      toast.success("Department updated.");
    } else {
      setDepartments((prev) => [
        { id: createId(), name, status: departmentFormValues.status },
        ...prev,
      ]);
      toast.success("Department added.");
    }
    resetDepartmentForm();
  };

  const handleSkillSubmit = () => {
    const name = skillFormValues.name.trim();
    if (!name) return toast.error("Skill name is required.");
    const normalized = name.toLowerCase();
    const duplicate = skills.some(
      (s) => s.name.trim().toLowerCase() === normalized && s.id !== editingSkillId
    );
    if (duplicate) return toast.error("Skill name must be unique.");

    if (editingSkillId) {
      setSkills((prev) =>
        prev.map((s) =>
          s.id === editingSkillId
            ? { ...s, name, status: skillFormValues.status }
            : s
        )
      );
      toast.success("Skill updated.");
    } else {
      setSkills((prev) => [
        { id: createId(), name, status: skillFormValues.status },
        ...prev,
      ]);
      toast.success("Skill added.");
    }
    resetSkillForm();
  };

  const handleTaskTypeSubmit = () => {
    const { name, departmentId, skillIds, status } = taskTypeFormValues;
    const trimmed = name.trim();
    if (!trimmed || !departmentId)
      return toast.error("Task type name and department are required.");

    if (editingTaskTypeId) {
      setTaskTypes((prev) =>
        prev.map((t) =>
          t.id === editingTaskTypeId
            ? { ...t, name: trimmed, departmentId, skillIds, status }
            : t
        )
      );
      toast.success("Task type updated.");
    } else {
      setTaskTypes((prev) => [
        { id: createId(), name: trimmed, departmentId, skillIds, status },
        ...prev,
      ]);
      toast.success("Task type added.");
    }
    resetTaskTypeForm(departmentId);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setTaskTypes((prev) =>
      prev.map((t) =>
        t.departmentId === id ? { ...t, departmentId: departments[0]?.id ?? "" } : t
      )
    );
  };
  const handleDeleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setTaskTypes((prev) =>
      prev.map((t) => ({ ...t, skillIds: t.skillIds.filter((sid) => sid !== id) }))
    );
  };
  const handleDeleteTaskType = (id: string) =>
    setTaskTypes((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="space-y-8">
      {/* Departments */}
      <section className="space-y-4">
        <Card className="shadow-sm">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Departments</h2>
            <Button
              onClick={() => {
                setDepartmentFormValues(defaultDepartmentForm);
                setEditingDepartmentId(null);
                setIsDepartmentDialogOpen(true);
              }}
            >
              Add Department
            </Button>
          </div>
          <div className="px-6 py-6">
            {filteredDepartments.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No departments yet.</div>
            ) : (
              <ResponsiveCardTable
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-32 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDepartments.map((dept) => (
                        <TableRow key={dept.id}>
                          <TableCell className="font-medium">{dept.name}</TableCell>
                          <TableCell>
                            <Badge variant={dept.status === "active" ? "default" : "secondary"}>{dept.status === "active" ? "Active" : "Inactive"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" aria-label={`Edit ${dept.name}`} onClick={() => { setDepartmentFormValues({ name: dept.name, status: dept.status }); setEditingDepartmentId(dept.id); setIsDepartmentDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" aria-label={`Delete ${dept.name}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete department {dept.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>This removes the department.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDepartment(dept.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                }
                cards={filteredDepartments.map((dept) => (
                  <Card key={dept.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Department</p>
                        <h3 className="text-lg font-semibold">{dept.name}</h3>
                      </div>
                      <Badge variant={dept.status === "active" ? "default" : "secondary"} className="shrink-0">{dept.status === "active" ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => { setDepartmentFormValues({ name: dept.name, status: dept.status }); setEditingDepartmentId(dept.id); setIsDepartmentDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete department {dept.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This removes the department.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDepartment(dept.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
                cardsClassName="space-y-4"
              />
            )}
          </div>
        </Card>
        <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDepartmentId ? "Edit Department" : "Create Department"}</DialogTitle>
              <DialogDescription>Manage department details</DialogDescription>
            </DialogHeader>
            <FormBuilder
              schema={departmentFormSchema}
              value={departmentFormValues}
              onChange={setDepartmentFormValues}
              onSave={handleDepartmentSubmit}
              onCancel={resetDepartmentForm}
              submitLabel={editingDepartmentId ? "Save Changes" : "Create Department"}
              className="space-y-6 text-sm"
              style={{}}
            />
          </DialogContent>
        </Dialog>
      </section>

      {/* Skills */}
      <section className="space-y-4 mt-6">
        <Card className="shadow-sm">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Skills</h2>
            <Button
              onClick={() => {
                setSkillFormValues(defaultSkillForm);
                setEditingSkillId(null);
                setIsSkillDialogOpen(true);
              }}
            >
              Add Skill
            </Button>
          </div>
          <div className="px-6 py-6">
            {filteredSkills.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No skills yet.</div>
            ) : (
              <ResponsiveCardTable
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-32 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSkills.map((skill) => (
                        <TableRow key={skill.id}>
                          <TableCell className="font-medium">{skill.name}</TableCell>
                          <TableCell>
                            <Badge variant={skill.status === "active" ? "default" : "secondary"}>{skill.status === "active" ? "Active" : "Inactive"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" aria-label={`Edit ${skill.name}`} onClick={() => { setSkillFormValues({ name: skill.name, status: skill.status }); setEditingSkillId(skill.id); setIsSkillDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" aria-label={`Delete ${skill.name}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete skill {skill.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>Removing this skill will also remove it from task types that use it.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                }
                cards={filteredSkills.map((skill) => (
                  <Card key={skill.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Skill</p>
                        <h3 className="text-lg font-semibold">{skill.name}</h3>
                      </div>
                      <Badge variant={skill.status === "active" ? "default" : "secondary"} className="shrink-0">{skill.status === "active" ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => { setSkillFormValues({ name: skill.name, status: skill.status }); setEditingSkillId(skill.id); setIsSkillDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete skill {skill.name}?</AlertDialogTitle>
                            <AlertDialogDescription>Removing this skill will also remove it from task types that use it.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSkill(skill.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
                cardsClassName="space-y-4"
              />
            )}
          </div>
        </Card>
        <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSkillId ? "Edit Skill" : "Create Skill"}</DialogTitle>
              <DialogDescription>Manage skill details</DialogDescription>
            </DialogHeader>
            <FormBuilder
              schema={skillFormSchema}
              value={skillFormValues}
              onChange={setSkillFormValues}
              onSave={handleSkillSubmit}
              onCancel={resetSkillForm}
              submitLabel={editingSkillId ? "Save Changes" : "Create Skill"}
              className="space-y-6 text-sm"
              style={{}}
            />
          </DialogContent>
        </Dialog>
      </section>

      {/* Task Types */}
      <section className="space-y-4 mt-6">
        <Card className="shadow-sm">
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Task Types</h2>
            <Button
              onClick={() => {
                if (!departments.length || !skills.length) return;
                setTaskTypeFormValues(defaultTaskTypeForm(departmentOptions[0]?.value));
                setEditingTaskTypeId(null);
                setIsTaskTypeDialogOpen(true);
              }}
              disabled={!departments.length || !skills.length}
              title={
                !departments.length
                  ? "Add a department before creating task types."
                  : !skills.length
                  ? "Add skills before creating task types."
                  : undefined
              }
            >
              Add Task Type
            </Button>
          </div>
          <div className="px-6 py-6">
            {filteredTaskTypes.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">No task types yet.</div>
            ) : (
              <ResponsiveCardTable
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Required Skills</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-32 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTaskTypes.map((taskType) => (
                        <TableRow key={taskType.id}>
                          <TableCell className="font-medium">{taskType.name}</TableCell>
                          <TableCell>{departmentLookup.get(taskType.departmentId) ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {taskType.skillIds.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                              {taskType.skillIds.map((sid) => (
                                <Badge key={sid} variant="outline">{skillLookup.get(sid) ?? "Unknown"}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={taskType.status === "active" ? "default" : "secondary"}>{taskType.status === "active" ? "Active" : "Inactive"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" aria-label={`Edit ${taskType.name}`} onClick={() => { setTaskTypeFormValues({ name: taskType.name, departmentId: taskType.departmentId, skillIds: taskType.skillIds, status: taskType.status }); setEditingTaskTypeId(taskType.id); setIsTaskTypeDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" aria-label={`Delete ${taskType.name}`}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete task type {taskType.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>This removes the task type from new jobs. Existing tasks keep their history.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteTaskType(taskType.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                }
                cards={filteredTaskTypes.map((taskType) => (
                  <Card key={taskType.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Task Type</p>
                        <h3 className="text-lg font-semibold">{taskType.name}</h3>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Department:</span> {departmentLookup.get(taskType.departmentId) ?? "-"}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Required Skills:</span>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {taskType.skillIds.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
                            {taskType.skillIds.map((sid) => (
                              <Badge key={sid} variant="outline">{skillLookup.get(sid) ?? "Unknown"}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge variant={taskType.status === "active" ? "default" : "secondary"} className="shrink-0">{taskType.status === "active" ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => { setTaskTypeFormValues({ name: taskType.name, departmentId: taskType.departmentId, skillIds: taskType.skillIds, status: taskType.status }); setEditingTaskTypeId(taskType.id); setIsTaskTypeDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete task type {taskType.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This removes the task type from new jobs. Existing tasks keep their history.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTaskType(taskType.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
                cardsClassName="space-y-4"
              />
            )}
          </div>
        </Card>
        <Dialog open={isTaskTypeDialogOpen} onOpenChange={setIsTaskTypeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTaskTypeId ? "Edit Task Type" : "Create Task Type"}</DialogTitle>
              <DialogDescription>Define task type details</DialogDescription>
            </DialogHeader>
            <FormBuilder
              schema={taskTypeFormSchema}
              value={taskTypeFormValues}
              onChange={(next) => setTaskTypeFormValues(next as TaskTypeFormValues)}
              onSave={handleTaskTypeSubmit}
              onCancel={() => resetTaskTypeForm(taskTypeFormValues.departmentId)}
              submitLabel={editingTaskTypeId ? "Save Changes" : "Create Task Type"}
              dataSources={{ skills: skillDataSource }}
              className="space-y-6 text-sm"
              style={{}}
            />
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
