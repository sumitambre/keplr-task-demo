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

  const [isDepartmentCreateOpen, setIsDepartmentCreateOpen] = useState(false);
  const [isSkillCreateOpen, setIsSkillCreateOpen] = useState(false);
  const [isTaskTypeCreateOpen, setIsTaskTypeCreateOpen] = useState(false);

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
    setIsDepartmentCreateOpen(false);
    setEditingDepartmentId(null);
  };

  const resetSkillForm = () => {
    setSkillFormValues(defaultSkillForm);
    setIsSkillCreateOpen(false);
    setEditingSkillId(null);
  };

  const resetTaskTypeForm = (departmentId?: string) => {
    setTaskTypeFormValues(defaultTaskTypeForm(departmentId ?? departments[0]?.id));
    setIsTaskTypeCreateOpen(false);
    setEditingTaskTypeId(null);
  };

  const handleDepartmentSubmit = () => {
    const name = departmentFormValues.name.trim();
    if (!name) {
      toast.error("Department name is required.");
      return;
    }
    const normalized = name.toLowerCase();
    const duplicate = departments.some(
      (dept) => dept.name.trim().toLowerCase() === normalized && dept.id !== editingDepartmentId
    );
    if (duplicate) {
      toast.error("Department name must be unique.");
      return;
    }

    if (editingDepartmentId) {
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editingDepartmentId
            ? { ...dept, name, status: departmentFormValues.status }
            : dept
        )
      );
      toast.success("Department updated.");
    } else {
      const next: Department = {
        id: createId(),
        name,
        status: departmentFormValues.status,
      };
      setDepartments((prev) => [next, ...prev]);
      toast.success("Department added.");
    }
    resetDepartmentForm();
  };

  const handleSkillSubmit = () => {
    const name = skillFormValues.name.trim();
    if (!name) {
      toast.error("Skill name is required.");
      return;
    }
    const normalized = name.toLowerCase();
    const duplicate = skills.some(
      (skill) => skill.name.trim().toLowerCase() === normalized && skill.id !== editingSkillId
    );
    if (duplicate) {
      toast.error("Skill name must be unique.");
      return;
    }




