export const userFormSchema = {
  title: 'User',
  sections: [
    {
      key: 'root',
      title: 'User Information',
      fields: [
        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'text', required: true },
        { key: 'phone', label: 'Phone', type: 'tel' },
        {
          key: 'role',
          label: 'Role',
          type: 'select',
          required: true,
          options: [
            { value: 'admin', label: 'Admin' },
            { value: 'manager', label: 'Manager' },
            { value: 'technician', label: 'Technician' }
          ]
        },
        {
          key: 'isActive',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' }
          ]
        }
      ]
    }
  ]
};