import React from 'react';
import FormBuilder from './FormBuilder';
import { userFormSchema } from './userSchema';

export default function UserForm({
  value,
  onChange,
  onSave,
  onCancel,
  submitLabel = 'Save User'
}: {
  value: any;
  onChange: (next: any) => void;
  onSave: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  return (
    <FormBuilder
      schema={userFormSchema}
      value={value}
      onChange={onChange}
      onSave={onSave}
      onCancel={onCancel}
      submitLabel={submitLabel}
    />
  );
}