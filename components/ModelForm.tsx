'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileValue } from '@/lib/api';
import { getFieldComponent } from './fields/registry';

export interface ModelField {
  id: number;
  name: string;
  label: string;
  field_type: string;
  is_required: boolean;
  validation_rules: {
    accept?: string;
    max_size_mb?: number;
    multiple?: boolean;
  };
}

interface ModelFormProps {
  modelId: number;
  fields: ModelField[];
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
}

export default function ModelForm({ modelId, fields, onSubmit }: ModelFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(name: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function serializeForApi(data: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        // multiple files → array of IDs
        out[key] = (val as FileValue[]).filter((f) => !f._delete).map((f) => f.id);
      } else if (val && typeof val === 'object' && 'id' in val) {
        // single file → just the ID
        out[key] = (val as FileValue).id;
      } else {
        out[key] = val;
      }
    }
    return out;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const payload = {
        custom_model: modelId,
        data: serializeForApi(formData),
      };

      if (onSubmit) {
        await onSubmit(payload.data);
      } else {
        const res = await fetch('/api/backend/custom-model-instances/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Submit failed');
      }

      router.push('/success');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => {
        const FileFieldComponent = getFieldComponent(field.field_type);

        if (FileFieldComponent) {
          return (
            <div className="form-group" key={field.id}>
              <FileFieldComponent
                name={field.name}
                label={field.label}
                value={(formData[field.name] as FileValue | FileValue[] | null) ?? null}
                onChange={(val) => handleChange(field.name, val)}
                accept={
                  field.field_type === 'image' || field.field_type === 'multi_image'
                    ? 'image/*'
                    : field.validation_rules?.accept
                }
                maxSizeMb={field.validation_rules?.max_size_mb}
                multiple={
                  field.field_type === 'multi_image' || field.validation_rules?.multiple
                }
              />
            </div>
          );
        }

        // text / textarea fallback
        return (
          <div className="form-group" key={field.id}>
            <label>{field.label}{field.is_required && ' *'}</label>
            {field.field_type === 'textarea' ? (
              <textarea
                name={field.name}
                value={(formData[field.name] as string) ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.is_required}
                rows={4}
              />
            ) : (
              <input
                type="text"
                name={field.name}
                value={(formData[field.name] as string) ?? ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                required={field.is_required}
              />
            )}
          </div>
        );
      })}

      {submitError && <p className="form-error">{submitError}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? <span className="spinner" /> : 'Submit'}
      </button>
    </form>
  );
}
