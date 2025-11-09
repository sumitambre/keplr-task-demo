import React, { useEffect, useMemo } from 'react';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Trash2, Plus } from 'lucide-react';
import { ComboboxPopover } from '@repo/ui';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type FieldBase = {
  key: string;
  label: string;
  required?: boolean;
  helperText?: string;
  placeholder?: string;
};

type TextField = FieldBase & { type: 'text' | 'tel' | 'email' | 'number' | 'textarea' };
type SelectField = FieldBase & { type: 'select'; options: { value: string; label: string }[] };
type ComboboxField = FieldBase & { type: 'combobox'; multiple?: boolean; dataSourceKey?: string };

export type Field = TextField | SelectField | ComboboxField;

export type Section = { key: string; title?: string; fields: Field[]; repeatable?: boolean };

export type Schema = {
  title?: string;
  sections: Section[];
};

type Props = {
  schema: Schema;
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  onSave?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  dataSources?: Record<string, (string | { id: string; name: string })[]>;
  renderExtras?: any;
  extrasAfterFieldKey?: string;
  className?: string;
  style?: React.CSSProperties;
  showSubmit?: boolean;
  validation?: z.ZodTypeAny; // optional external zod schema
};

export default function FormBuilder({
  schema,
  value,
  onChange,
  onSave,
  onCancel,
  submitLabel,
  dataSources = {},
  renderExtras,
  extrasAfterFieldKey,
  className,
  style,
  showSubmit = true,
  validation,
}: Props) {
  // Build a zod schema from field definitions, unless provided
  const computedZod = useMemo(() => {
    if (validation) return validation;
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const section of schema.sections) {
      for (const field of section.fields) {
        let base: z.ZodTypeAny;
        if (field.type === 'combobox') {
          base = field.multiple ? z.array(z.string()) : z.string();
        } else if (field.type === 'number') {
          // keep as string input in UI; coerce later if needed
          base = z.string();
        } else {
          base = z.string();
        }
        shape[field.key] = field.required
          ? (base instanceof z.ZodArray
              ? base.min(1, `${field.label} is required`)
              : base.min(1, `${field.label} is required`))
          : base.optional();
      }
    }
    return z.object(shape);
  }, [schema, validation]);

  const form = useForm<any>({
    resolver: zodResolver(computedZod),
    defaultValues: value || {},
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const { control, handleSubmit, reset, watch, setValue, formState } = form;

  // keep external value in sync
  useEffect(() => {
    reset(value || {});
  }, [value, reset]);

  // bubble changes up for controlled usage
  useEffect(() => {
    const sub = watch((v) => {
      onChange(v as any);
    });
    return () => sub.unsubscribe();
  }, [watch, onChange]);

  const addRepeat = (section: Section) => {
    const current = (watch(section.key) as any[]) || [];
    setValue(section.key, [...current, {}], { shouldDirty: true });
  };

  const removeRepeat = (sectionKey: string, index: number) => {
    const current = (watch(sectionKey) as any[]) || [];
    const next = current.filter((_, i) => i !== index);
    setValue(sectionKey, next, { shouldDirty: true });
  };

  const renderField = (field: Field, sectionKey?: string, index?: number) => {
    const name = sectionKey != null && typeof index === 'number'
      ? `${sectionKey}.${index}.${field.key}`
      : field.key;
    const id = `${name}-field`;

    if (field.type === 'textarea') {
      return (
        <div key={name} className="space-y-2">
          <Label htmlFor={id}>{field.label}{field.required ? ' *' : ''}</Label>
          <Controller
            control={control}
            name={name as any}
            render={({ field: f }) => (
              <Textarea id={id} placeholder={field.placeholder} value={(f.value ?? '') as any} onChange={(e) => f.onChange(e.target.value)} />
            )}
          />
          {formState.errors && (formState.errors as any)[name] && (
            <p className="text-xs text-destructive">{(formState.errors as any)[name]?.message as any}</p>
          )}
          {field.helperText && (
            <p className="text-xs text-muted-foreground">{field.helperText}</p>
          )}
        </div>
      );
    }

    if (field.type === 'select' && (field as SelectField).options) {
      const options = (field as SelectField).options;
      return (
        <div key={name} className="space-y-2">
          <Label htmlFor={id}>{field.label}{field.required ? ' *' : ''}</Label>
          <Controller
            control={control}
            name={name as any}
            render={({ field: f }) => (
              <select id={id} className="w-full rounded-md border px-3 py-2" value={(f.value ?? '') as any} onChange={(e) => f.onChange(e.target.value)}>
                <option value=""></option>
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          />
          {formState.errors && (formState.errors as any)[name] && (
            <p className="text-xs text-destructive">{(formState.errors as any)[name]?.message as any}</p>
          )}
          {field.helperText && (
            <p className="text-xs text-muted-foreground">{field.helperText}</p>
          )}
        </div>
      );
    }

    if (field.type === 'combobox') {
      const itemsRaw = (field.dataSourceKey && dataSources[field.dataSourceKey]) || [];
      const items = itemsRaw.map((item) =>
        typeof item === 'string' ? { id: item, name: item } : item
      );
      const multiple = !!field.multiple;
      return (
        <div key={name} className="space-y-2">
          <Controller
            control={control}
            name={name as any}
            render={({ field: f }) => {
              const val = f.value;
              const selected: string[] = multiple
                ? (Array.isArray(val) ? val : (val ? [val] : []))
                : (typeof val === 'string' ? (val ? [val] : []) : (Array.isArray(val) ? val : []));
              return (
                <ComboboxPopover
                  title={field.label}
                  items={items}
                  selectedItems={selected}
                  onSelectionChange={(selectedItems: string[]) => {
                    if (multiple) f.onChange(selectedItems);
                    else f.onChange(selectedItems[0] ?? '');
                  }}
                  triggerText={`Select ${field.label.toLowerCase()}`}
                  searchPlaceholder={`Search ${field.label.toLowerCase()}...`}
                  emptyText={`No ${field.label.toLowerCase()} found.`}
                />
              );
            }}
          />
          {formState.errors && (formState.errors as any)[name] && (
            <p className="text-xs text-destructive">{(formState.errors as any)[name]?.message as any}</p>
          )}
          {field.helperText && (
            <p className="text-xs text-muted-foreground">{field.helperText}</p>
          )}
        </div>
      );
    }

    // default: input text/tel/email/number
    return (
      <div key={name} className="space-y-2">
        <Label htmlFor={id}>{field.label}{field.required ? ' *' : ''}</Label>
        <Controller
          control={control}
          name={name as any}
          render={({ field: f }) => (
            <Input id={id} placeholder={field.placeholder} value={(f.value ?? '') as any} onChange={(e: React.ChangeEvent<HTMLInputElement>) => f.onChange(e.target.value)} />
          )}
        />
        {formState.errors && (formState.errors as any)[name] && (
          <p className="text-xs text-destructive">{(formState.errors as any)[name]?.message as any}</p>
        )}
        {field.helperText && (
          <p className="text-xs text-muted-foreground">{field.helperText}</p>
        )}
      </div>
    );
  };

  // Provide a sensible default that scrolls within viewport without requiring parent heights.
  // Consumers can still override via className/style props.
  const formClassName =
    className ?? 'space-y-6 text-sm w-full md:w-4/5 mx-auto overflow-auto pr-2';
  const formStyle =
    style ?? ({ maxHeight: 'calc(100dvh - 10rem)' } as React.CSSProperties);

  const helpers = {
    setField: (_sectionKey: string, fieldKey: string, v: any, _index?: number) => setValue(fieldKey, v, { shouldDirty: true, shouldTouch: true }),
    setRootField: (fieldKey: string, v: any) => setValue(fieldKey, v, { shouldDirty: true, shouldTouch: true }),
    onChange: (next: any) => onChange(next),
    getValues: () => watch() as any,
    setValue,
  };

  const onSubmit = handleSubmit(() => {
    onSave && onSave();
  });

  return (
    <form className={formClassName} style={formStyle} onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      {schema.title && <h3 className="text-lg font-medium">{schema.title}</h3>}

      {schema.sections.map((section) => (
        <div key={section.key} className="space-y-4">
          {section.title && <h4 className="text-base font-semibold">{section.title}</h4>}

          {section.repeatable ? (
            <>
              {(((watch(section.key) as any[]) ?? [])).map((_, idx: number) => (
                <Card key={idx}>
                  <CardHeader className="flex justify-between items-center px-4 py-3">
                    <CardTitle>#{idx + 1}</CardTitle>
                    <div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRepeat(section.key, idx)} aria-label={`Remove ${section.title ?? section.key} ${idx + 1}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 form-grid" style={{ columnGap: '24px', rowGap: '16px' }}>
                    {section.fields.map(f => renderField(f, section.key, idx))}
                  </CardContent>
                </Card>
              ))}
              <div>
                <Button type="button" className="mt-1" size="sm" onClick={() => addRepeat(section)}>
                  <Plus className="h-4 w-4 mr-2" /> Add {section.title ?? section.key}
                </Button>
              </div>
            </>
          ) : (
            <div className="form-grid" style={{ columnGap: '24px', rowGap: '16px' }}>
              {section.fields.map((f) => (
                <React.Fragment key={f.key}>
                  {renderField(f)}
                  {extrasAfterFieldKey && f.key === extrasAfterFieldKey && renderExtras && (
                    <div className="md:col-span-2">{renderExtras(watch() as any, helpers)}</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      ))}

      {!extrasAfterFieldKey && renderExtras && renderExtras(watch() as any, helpers)}

      {showSubmit && (
        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{submitLabel ?? 'Save'}</Button>
        </div>
      )}
    </form>
  );
}
